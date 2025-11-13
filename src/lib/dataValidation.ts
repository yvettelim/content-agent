import { WechatArticle, WechatApiResponse } from '@/types';

// 数据验证接口
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export interface ArticleDataQuality {
  article: WechatArticle;
  issues: string[];
  qualityScore: number; // 0-100
  dataFieldsStatus: {
    title: boolean;
    content: boolean;
    read: boolean;
    praise: boolean;
    looking: boolean;
    url: boolean;
    wx_name: boolean;
    publish_time: boolean;
  };
}

/**
 * 验证单篇文章数据的合理性
 */
export function validateArticleData(article: WechatArticle): ArticleDataQuality {
  const issues: string[] = [];
  const dataFieldsStatus = {
    title: !!article.title && article.title.trim().length > 0,
    content: !!article.content && article.content.trim().length > 0,
    read: typeof article.read === 'number' && article.read >= 0,
    praise: typeof article.praise === 'number' && article.praise >= 0,
    looking: typeof article.looking === 'number' && article.looking >= 0,
    url: !!article.url && article.url.startsWith('http'),
    wx_name: !!article.wx_name && article.wx_name.trim().length > 0,
    publish_time: typeof article.publish_time === 'number' && article.publish_time > 0,
  };

  // 检查数据合理性
  const read = article.read || 0;
  const praise = article.praise || 0;
  const looking = article.looking || 0;

  // 基本数据检查
  if (!dataFieldsStatus.title) issues.push('标题缺失或为空');
  if (!dataFieldsStatus.content) issues.push('内容缺失或为空');
  if (!dataFieldsStatus.wx_name) issues.push('公众号名称缺失');
  if (!dataFieldsStatus.url) issues.push('文章链接缺失或格式错误');
  if (!dataFieldsStatus.publish_time) issues.push('发布时间无效');

  // 数据合理性检查
  if (read === 0) {
    issues.push('阅读量为0，可能数据不完整');
  } else {
    if (praise > read) {
      issues.push(`点赞数(${praise})大于阅读数(${read})，数据异常`);
    }
    if (looking > read) {
      issues.push(`在看数(${looking})大于阅读数(${read})，数据异常`);
    }
    if (praise + looking > read * 0.5) {
      issues.push('互动率异常高，可能数据不准确');
    }
  }

  // 时间戳检查
  if (dataFieldsStatus.publish_time) {
    const publishDate = new Date(article.publish_time * 1000);
    const now = new Date();
    const daysDiff = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 365) {
      issues.push('文章发布时间超过1年，可能数据过时');
    }
    if (daysDiff < 0) {
      issues.push('文章发布时间在未来，时间戳异常');
    }
  }

  // 内容长度检查
  if (dataFieldsStatus.content) {
    if (article.content.length < 100) {
      issues.push('文章内容过短，可能不完整');
    }
    if (article.content.length > 100000) {
      issues.push('文章内容过长，可能包含无关内容');
    }
  }

  // 计算质量分数
  const fieldScore = Object.values(dataFieldsStatus).filter(Boolean).length / Object.keys(dataFieldsStatus).length;
  const issuePenalty = Math.min(issues.length * 10, 70); // 每个问题扣10分，最多扣70分
  const qualityScore = Math.max(0, Math.round(fieldScore * 100 - issuePenalty));

  return {
    article,
    issues,
    qualityScore,
    dataFieldsStatus,
  };
}

/**
 * 验证文章列表数据
 */
export function validateArticlesData(articles: WechatArticle[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let validCount = 0;
  const qualityReports: ArticleDataQuality[] = [];

  articles.forEach((article, index) => {
    const quality = validateArticleData(article);
    qualityReports.push(quality);

    if (quality.qualityScore >= 70) {
      validCount++;
    } else if (quality.qualityScore < 30) {
      errors.push(`文章 ${index + 1} 数据质量极低: ${quality.issues.join(', ')}`);
    } else {
      warnings.push(`文章 ${index + 1} 数据质量一般: ${quality.issues.slice(0, 2).join(', ')}`);
    }
  });

  // 统计分析
  const avgQuality = qualityReports.reduce((sum, report) => sum + report.qualityScore, 0) / qualityReports.length;
  const zeroReadCount = articles.filter(a => (a.read || 0) === 0).length;
  const suspiciousHighEngagement = articles.filter(a => {
    const read = a.read || 0;
    const praise = a.praise || 0;
    const looking = a.looking || 0;
    return read > 0 && (praise + looking) / read > 0.3;
  }).length;

  // 添加统计性警告
  if (zeroReadCount / articles.length > 0.5) {
    warnings.push(`超过50%的文章阅读量为0 (${zeroReadCount}/${articles.length})`);
  }
  if (avgQuality < 60) {
    warnings.push(`整体数据质量偏低 (平均质量分数: ${avgQuality.toFixed(1)})`);
  }
  if (suspiciousHighEngagement > 0) {
    warnings.push(`发现${suspiciousHighEngagement}篇文章互动率异常高 (>30%)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      total: articles.length,
      valid: validCount,
      invalid: articles.length - validCount,
    },
  };
}

/**
 * 验证API响应
 */
export function validateApiResponse(response: WechatApiResponse): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 基本响应检查
  if (response.code !== 0) {
    errors.push(`API错误: ${response.msg || '未知错误'} (code: ${response.code})`);
  }

  if (!response.data || !Array.isArray(response.data)) {
    errors.push('API返回数据格式错误');
    return {
      isValid: false,
      errors,
      warnings,
      stats: { total: 0, valid: 0, invalid: 0 },
    };
  }

  // 数据完整性检查
  if (response.data.length === 0) {
    warnings.push('API返回空数据集');
    return {
      isValid: true,
      errors,
      warnings,
      stats: { total: 0, valid: 0, invalid: 0 },
    };
  }

  if (response.data_number !== response.data.length) {
    warnings.push(`数据数量不匹配: 声明${response.data_number}条，实际${response.data.length}条`);
  }

  if (response.total > 0 && response.data.length > response.total) {
    warnings.push(`返回数据超过声明总数: ${response.data.length} > ${response.total}`);
  }

  // 验证文章数据
  const articleValidation = validateArticlesData(response.data);

  return {
    isValid: errors.length === 0 && articleValidation.isValid,
    errors: [...errors, ...articleValidation.errors],
    warnings: [...warnings, ...articleValidation.warnings],
    stats: articleValidation.stats,
  };
}

/**
 * 数据质量报告
 */
export function generateDataQualityReport(articles: WechatArticle[]): {
  summary: string;
  details: ArticleDataQuality[];
  recommendations: string[];
} {
  const validation = validateArticlesData(articles);
  const details = articles.map(article => validateArticleData(article));

  // 生成推荐建议
  const recommendations: string[] = [];

  const avgQuality = details.reduce((sum, report) => sum + report.qualityScore, 0) / details.length;
  if (avgQuality < 70) {
    recommendations.push('建议检查API数据源的质量，可能存在数据获取问题');
  }

  const zeroReadCount = details.filter(report => report.article.read === 0).length;
  if (zeroReadCount > articles.length * 0.3) {
    recommendations.push('大量文章阅读量为0，建议检查时间范围设置或API参数');
  }

  const missingFields = details.filter(report =>
    !report.dataFieldsStatus.url || !report.dataFieldsStatus.content
  ).length;
  if (missingFields > articles.length * 0.2) {
    recommendations.push('部分文章缺少关键字段，建议检查API响应格式');
  }

  const suspiciousData = details.filter(report => report.qualityScore < 30).length;
  if (suspiciousData > 0) {
    recommendations.push('发现异常数据，建议实现数据清洗和过滤机制');
  }

  const summary = `数据质量报告: 共${articles.length}篇文章，有效数据${validation.stats.valid}条 (${(validation.stats.valid / articles.length * 100).toFixed(1)}%)，平均质量分数${avgQuality.toFixed(1)}`;

  return {
    summary,
    details,
    recommendations,
  };
}