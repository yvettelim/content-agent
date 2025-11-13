import { searchWechatArticles, WechatApiParams } from './api';
import { saveAnalysis, fetchAnalysisDetail, searchWechatArticles as fetchWechatArticles } from './apiService';
import { TopicAnalysis, WechatArticle } from '@/types';

export interface AnalysisProgress {
  currentStep: number;
  totalSteps: number;
  currentMessage: string;
  percentage?: number;
}

export interface AnalysisConfig {
  keyword: string;
  articleCount: number;
  timeRange: number;
  includeAnyKeywords?: string;
  excludeKeywords?: string;
  maxPages?: number;
}

/**
 * 执行完整的选题分析流程
 */
export async function performTopicAnalysis(
  config: AnalysisConfig,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<{ analysis: TopicAnalysis; articles: WechatArticle[] }> {
  const analysisId = crypto.randomUUID();
  const startTime = new Date().toISOString();

  try {
    // 第1步：准备搜索参数
    onProgress?.({
      currentStep: 1,
      totalSteps: 5,
      currentMessage: '准备搜索参数...',
      percentage: 10
    });

    // 创建分析记录
    const analysisData: Omit<TopicAnalysis, 'id' | 'createdAt'> & { id: string } = {
      id: analysisId,
      keyword: config.keyword,
      articleCount: config.articleCount,
      timeRange: config.timeRange,
      status: 'processing',
      totalArticles: 0,
      avgEngagementRate: 0,
    };

    // 先保存处理中的状态
    await saveAnalysis(analysisData, []);

    // 第2步：调用公众号API
    onProgress?.({
      currentStep: 2,
      totalSteps: 5,
      currentMessage: '正在调用公众号API...',
      percentage: 25
    });

    const apiParams: WechatApiParams = {
      kw: config.keyword,
      sort_type: 1, // 按发布时间排序，确保覆盖完整时间范围
      mode: 1,
      period: config.timeRange,
      page: 1,
      any_kw: config.includeAnyKeywords || '',
      ex_kw: config.excludeKeywords || '',
      type: 1,
    };

    // 计算需要获取的页数（每页默认20条，API返回）
    const minPagesNeeded = Math.ceil(config.articleCount / 20) || 1;
    const maxPages = Math.min(
      20,
      config.maxPages ? Math.max(config.maxPages, minPagesNeeded) : Math.max(5, minPagesNeeded)
    );

    const apiResponse = await fetchWechatArticles({
      ...apiParams,
      usePagination: true,
      maxPages,
    });

    if (apiResponse.data.length === 0) {
      throw new Error(`未找到关键词"${config.keyword}"的相关文章，请尝试使用其他关键词`);
    }

    onProgress?.({
      currentStep: 3,
      totalSteps: 5,
      currentMessage: `找到 ${apiResponse.data.length} 篇文章，正在处理数据...`,
      percentage: 60
    });

    // 第3步：处理和分析数据
    const processedArticles = processArticles(apiResponse.data);
    const filteredArticles = filterArticlesByTimeRange(processedArticles, config.timeRange);

    const limitedArticles = config.articleCount > 0
      ? filteredArticles.slice(0, config.articleCount)
      : filteredArticles;

    // 计算平均互动率
    const avgEngagementRate = calculateAvgEngagementRate(limitedArticles);

    // 第4步：保存数据到数据库
    onProgress?.({
      currentStep: 4,
      totalSteps: 5,
      currentMessage: '正在保存分析结果...',
      percentage: 85
    });

    // 更新分析记录
    const completedAnalysis: Omit<TopicAnalysis, 'id' | 'createdAt'> & { id: string } = {
      id: analysisId,
      keyword: config.keyword,
      articleCount: config.articleCount,
      timeRange: config.timeRange,
      status: 'completed',
      completedAt: new Date().toISOString(),
      totalArticles: limitedArticles.length,
      avgEngagementRate,
      apiResponse,
    };

    // 保存最终结果
    await saveAnalysis(completedAnalysis, limitedArticles);

    // 第5步：完成
    onProgress?.({
      currentStep: 5,
      totalSteps: 5,
      currentMessage: '分析完成！',
      percentage: 100
    });

    const finalAnalysis = {
      ...completedAnalysis,
      id: analysisId,
      createdAt: startTime,
    } as TopicAnalysis;

    return { analysis: finalAnalysis, articles: limitedArticles };

  } catch (error) {
    // 更新分析状态为失败
    const failedAnalysis: Omit<TopicAnalysis, 'id' | 'createdAt'> & { id: string } = {
      id: analysisId,
      keyword: config.keyword,
      articleCount: config.articleCount,
      timeRange: config.timeRange,
      status: 'failed',
      completedAt: new Date().toISOString(),
      totalArticles: 0,
      avgEngagementRate: 0,
      errorMessage: error instanceof Error ? error.message : '未知错误',
    };

    try {
      await saveAnalysis(failedAnalysis, []);
    } catch (saveError) {
      console.error('保存失败状态时出错:', saveError);
    }

    throw error;
  }
}

/**
 * 处理文章数据，计算额外指标
 */
function processArticles(articles: WechatArticle[]): WechatArticle[] {
  return articles.map(article => {
    // 可以在这里进行数据清理、验证等处理
    const publishTime = article.publish_time || (article.publish_time_str
      ? Math.floor(new Date(article.publish_time_str).getTime() / 1000)
      : 0);

    return {
      ...article,
      // 确保必要字段存在
      read: article.read || 0,
      praise: article.praise || 0,
      looking: article.looking || 0,
      publish_time: publishTime,
      publish_time_str: article.publish_time_str || (publishTime ? new Date(publishTime * 1000).toISOString() : ''),
    };
  });
}

/**
 * 根据时间范围过滤文章（单位：天）
 */
function filterArticlesByTimeRange(articles: WechatArticle[], timeRangeDays: number): WechatArticle[] {
  if (!timeRangeDays || timeRangeDays <= 0) {
    return articles;
  }

  const now = Date.now();
  const rangeMs = timeRangeDays * 24 * 60 * 60 * 1000;

  return articles.filter(article => {
    const publishTime = typeof article.publish_time === 'number'
      ? article.publish_time
      : (article.publish_time_str ? Math.floor(new Date(article.publish_time_str).getTime() / 1000) : null);

    if (!publishTime) {
      return false;
    }

    const publishMs = publishTime * 1000;
    return publishMs >= now - rangeMs && publishMs <= now;
  });
}

/**
 * 计算单篇文章的互动率（改进版）
 */
function calculateEngagementRate(article: WechatArticle): number {
  const read = article.read || 0;
  const praise = article.praise || 0;
  const looking = article.looking || 0;

  if (read === 0) return 0;

  // 数据合理性检查
  if (praise > read || looking > read) {
    console.warn(`文章"${article.title}"数据异常: 阅读${read}, 点赞${praise}, 在看${looking}`);
    return 0;
  }

  const engagementRate = ((praise + looking) / read) * 100;

  return parseFloat(engagementRate.toFixed(2));
}

/**
 * 计算平均互动率
 */
function calculateAvgEngagementRate(articles: WechatArticle[]): number {
  if (articles.length === 0) return 0;

  const validEngagementRates = articles
    .map(article => calculateEngagementRate(article))
    .filter(rate => rate > 0); // 只计算有互动的文章

  if (validEngagementRates.length === 0) return 0;

  const totalEngagementRate = validEngagementRates.reduce((sum, rate) => sum + rate, 0);
  return totalEngagementRate / validEngagementRates.length;
}

/**
 * 获取分析结果（从API）
 */
export async function getAnalysisResult(analysisId: string, page: number = 1, pageSize: number = 20): Promise<{
  analysis: TopicAnalysis | null;
  articles: WechatArticle[];
  total: number;
  totalPage: number;
}> {
  try {
    const result = await fetchAnalysisDetail(analysisId, page, pageSize);
    return {
      analysis: result.analysis,
      articles: result.articles,
      total: result.total,
      totalPage: result.totalPage,
    };
  } catch (error) {
    console.error('获取分析结果失败:', error);
    return { analysis: null, articles: [], total: 0, totalPage: 0 };
  }
}

/**
 * 获取文章分页数据
 */
export async function getAnalysisArticles(
  analysisId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{
  articles: WechatArticle[];
  total: number;
  totalPage: number;
  hasMore: boolean;
}> {
  try {
    const result = await fetchAnalysisDetail(analysisId, page, pageSize);
    return {
      articles: result.articles,
      total: result.total,
      totalPage: result.totalPage,
      hasMore: page < result.totalPage,
    };
  } catch (error) {
    console.error('获取文章分页数据失败:', error);
    return { articles: [], total: 0, totalPage: 0, hasMore: false };
  }
}

/**
 * 生成洞察报告数据
 */
export function generateInsightReport(articles: WechatArticle[], keyword?: string) {
  if (!articles || articles.length === 0) {
    return {
      topLikedArticles: [],
      topEngagementArticles: [],
      wordCloud: [],
      insights: ['没有找到相关文章数据'],
      summary: {
        totalArticles: 0,
        avgEngagementRate: 0,
        avgReadCount: 0,
        avgPraiseCount: 0,
      }
    };
  }

  const sanitizedArticles = articles.map(article => ({
    ...article,
    read: typeof article.read === 'number' ? article.read : parseInt(String(article.read || 0), 10) || 0,
    praise: typeof article.praise === 'number' ? article.praise : parseInt(String(article.praise || 0), 10) || 0,
    looking: typeof article.looking === 'number' ? article.looking : parseInt(String(article.looking || 0), 10) || 0,
  }));

  // 按点赞数排序
  const topLikedArticles = sanitizedArticles
    .filter(article => (article.praise || 0) > 0)
    .sort((a, b) => (b.praise || 0) - (a.praise || 0))
    .slice(0, 5)
    .map(article => ({
      id: article.title,
      title: article.title,
      likeCount: article.praise || 0,
      readCount: article.read || 0,
      url: article.url,
    }));

  // 按互动率排序
  const articlesWithScore = sanitizedArticles.map(article => {
    const engagementRate = calculateEngagementRate(article);
    const score = engagementRate * Math.log10((article.read || 1) + 1);
    return {
      ...article,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      engagementScore: score,
    };
  });

  const topEngagementArticles = articlesWithScore
    .filter(article => (article.read || 0) >= 500 && article.engagementRate > 0)
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 5)
    .map(article => ({
      id: article.title,
      title: article.title,
      engagementRate: article.engagementRate,
      readCount: article.read || 0,
      url: article.url,
    }));

  // 生成词云数据（简单的词频统计）
  const wordCloud = generateWordCloud(sanitizedArticles, keyword);

  // 生成洞察建议
  const insights = generateInsights(sanitizedArticles);

  // 计算阅读量分布
  const readCountDistribution = calculateReadCountDistribution(sanitizedArticles);

  // 计算发布时间分布
  const publishTimeDistribution = calculatePublishTimeDistribution(sanitizedArticles);

  // 计算统计摘要
  const summary = {
    totalArticles: sanitizedArticles.length,
    avgEngagementRate: calculateAvgEngagementRate(sanitizedArticles),
    avgReadCount: sanitizedArticles.length > 0
      ? Math.round(sanitizedArticles.reduce((sum, a) => sum + (a.read || 0), 0) / sanitizedArticles.length)
      : 0,
    avgPraiseCount: sanitizedArticles.length > 0
      ? Math.round(sanitizedArticles.reduce((sum, a) => sum + (a.praise || 0), 0) / sanitizedArticles.length)
      : 0,
    readCountDistribution,
    publishTimeDistribution,
  };

  return {
    topLikedArticles,
    topEngagementArticles,
    wordCloud,
    insights,
    summary,
  };
}

/**
 * 生成词云数据
 */
function generateWordCloud(articles: WechatArticle[], keyword?: string) {
  const stopWords = new Set([
    '我们', '你们', '他们', '她们', '以及', '但是', '所以', '然后', '不是', '自己', '大家', '所有', '这个', '那个', '为了', '觉得',
    '进行', '通过', '提升', '提高', '发展', '方式', '非常', '可以', '已经', '不会', '还是', '这种', '这些', '那些', '针对', '关于',
    '就是', '因为', '因此', '如果', '如何', '或者', '一些', '很多', '更加', '不断', '需要', '拥有',
    '一定', '必须', '可能', '应该', '能够', '比如', '例如', '具有', '相关', '各种',
    '作为', '一种', '一些', '那些', '这些', '这样', '那样', '这里', '那里', '哪里', '什么', '怎么', '哪些', '哪种',
    '其中', '而且', '并且', '不过', '只是', '其实', '希望', '喜欢', '关注', '了解', '分享', '推荐',
    '用户', '读者', '朋友', '老师', '同学', '孩子', '父母', '家长', '企业', '公司', '客户', '平台', '产品',
    '一个', '两个', '三个', '第一', '第二', '第三', '部分', '每个', '多个', '不同', '更加',
    '提高', '提升', '发展', '实施', '完成', '达到', '实现', '带来', '创造', '打造', '发现', '选择', '注意',
    '看到', '认为', '表示', '觉得', '点击', '查看', '阅读', '点赞', '互动', '评论', '粉丝', '公众号', '微信',
    '同时', '目前', '现在', '未来', '去年', '今年', '本次', '此次', '每天', '每年', '每日', '每周', '近期', '最近', '快来', '速看'
  ]);

  const keywordVariants = buildKeywordVariantSet(keyword);

  const tokenReplacements: Array<{ pattern: RegExp; replace: string }> = [
    { pattern: /江西水利电力大学/g, replace: '江西水电大学' },
    { pattern: /教育发展基金/g, replace: '教育基金' },
    { pattern: /发展基金/g, replace: '教育基金' },
    { pattern: /教育基金会/g, replace: '教育基金' },
    { pattern: /(?:茅台集团|贵州茅台)/g, replace: '茅台' },
    { pattern: /(?:创新人才计划|创新人才)/g, replace: '创新人才' },
  ];

  type WordStats = {
    docCount: number;
    score: number;
  };

  const wordMap = new Map<string, WordStats>();

  articles.forEach(article => {
    const rawText = [article.title, article.content, article.wx_name]
      .filter(Boolean)
      .join(' ');

    let normalizedText = rawText;
    tokenReplacements.forEach(({ pattern, replace }) => {
      normalizedText = normalizedText.replace(pattern, replace);
    });

    normalizedText = normalizedText.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ');

    const candidates = normalizedText.match(/[\u4e00-\u9fa5a-zA-Z0-9]{2,}/g) || [];
    const uniqueTokens = new Set<string>();

    candidates.forEach(token => {
      const canonicalToken = normalizeToken(token, stopWords, keywordVariants);
      if (!canonicalToken) {
        return;
      }
      uniqueTokens.add(canonicalToken);
    });

    if (uniqueTokens.size === 0) {
      return;
    }

    const readSafe = Number(article.read) || 0;
    const articleHot = Math.log10(readSafe + 10);

    uniqueTokens.forEach(token => {
      const stats = wordMap.get(token) || { docCount: 0, score: 0 };
      stats.docCount += 1;
      stats.score += articleHot;
      wordMap.set(token, stats);
    });
  });

  let wordEntries = Array.from(wordMap.entries());

  let filteredEntries = wordEntries.filter(([, stats]) => stats.docCount >= 5);
  if (filteredEntries.length < 10) {
    filteredEntries = wordEntries.filter(([, stats]) => stats.docCount >= 3);
  }
  if (filteredEntries.length < 10) {
    filteredEntries = wordEntries;
  }

  return filteredEntries
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 15)
    .map(([word, stats]) => ({
      word,
      count: stats.docCount,
      score: parseFloat(stats.score.toFixed(2)),
    }));
}

function buildKeywordVariantSet(keyword?: string): Set<string> {
  const variants = new Set<string>();
  if (!keyword) return variants;

  const normalized = keyword.replace(/\s+/g, '').toLowerCase();
  if (!normalized) return variants;

  const suffixes = ['先生', '老师', '女士', '小姐', '董事长', '教授', '总'];

  variants.add(normalized);

  suffixes.forEach(suffix => {
    variants.add((normalized + suffix).toLowerCase());
  });

  const firstChar = normalized[0];
  if (firstChar) {
    variants.add(`${firstChar}总`);
    variants.add(`${firstChar}老师`);
    variants.add(`${firstChar}先生`);
  }

  return variants;
}

function normalizeToken(token: string, stopWords: Set<string>, keywordVariants: Set<string>): string | null {
  let normalized = token.trim();
  if (!normalized) return null;

  normalized = normalized.replace(/(先生|女士|老师|小姐|董事长|总)$/g, '');

  normalized = normalized.replace(/(人民币|元|块)$/g, '')
    .replace(/万元$/g, '万')
    .replace(/亿元$/g, '亿');

  const lowerNoSpace = normalized.replace(/\s+/g, '').toLowerCase();

  if (keywordVariants.has(lowerNoSpace)) {
    return null;
  }

  if (/^[0-9]+$/.test(lowerNoSpace)) {
    return null;
  }

  const tokenReplacements = new Map<string, string>([
    ['江西水利电力大学', '江西水电大学'],
    ['江西水电学院', '江西水电大学'],
    ['教育发展基金', '教育基金'],
    ['发展基金', '教育基金'],
    ['教育基金会', '教育基金'],
  ]);

  tokenReplacements.forEach((replacement, pattern) => {
    if (normalized.includes(pattern)) {
      normalized = normalized.replace(pattern, replacement);
    }
  });

  const lower = normalized.toLowerCase();
  if (stopWords.has(lower)) {
    return null;
  }

  return normalized;
}

/**
 * 计算阅读量分布
 */
function calculateReadCountDistribution(articles: WechatArticle[]) {
  const distribution = [
    { range: '0-1000', count: 0, label: '0-1k' },
    { range: '1001-5000', count: 0, label: '1k-5k' },
    { range: '5001-10000', count: 0, label: '5k-10k' },
    { range: '10001-50000', count: 0, label: '10k-50k' },
    { range: '50001+', count: 0, label: '50k+' },
  ];

  articles.forEach(article => {
    const readCount = article.read || 0;
    if (readCount <= 1000) {
      distribution[0].count++;
    } else if (readCount <= 5000) {
      distribution[1].count++;
    } else if (readCount <= 10000) {
      distribution[2].count++;
    } else if (readCount <= 50000) {
      distribution[3].count++;
    } else {
      distribution[4].count++;
    }
  });

  return distribution;
}

/**
 * 计算发布时间分布
 */
function calculatePublishTimeDistribution(articles: WechatArticle[]) {
  const now = Date.now();
  const distribution = [
    { range: '0-1', count: 0, label: '1天内' },
    { range: '1-3', count: 0, label: '1-3天' },
    { range: '3-7', count: 0, label: '3-7天' },
    { range: '7-30', count: 0, label: '7-30天' },
    { range: '30+', count: 0, label: '30天前' },
  ];

  articles.forEach(article => {
    const publishTime = (article.publish_time || 0) * 1000; // 转换为毫秒
    const hoursAgo = (now - publishTime) / (1000 * 60 * 60); // 小时前
    const daysAgo = hoursAgo / 24; // 天前

    if (daysAgo <= 1) {
      distribution[0].count++;
    } else if (daysAgo <= 3) {
      distribution[1].count++;
    } else if (daysAgo <= 7) {
      distribution[2].count++;
    } else if (daysAgo <= 30) {
      distribution[3].count++;
    } else {
      distribution[4].count++;
    }
  });

  return distribution;
}

/**
 * 生成洞察建议
 */
function generateInsights(articles: WechatArticle[]): string[] {
  const insights: string[] = [];

  if (articles.length === 0) {
    return ['没有足够的数据生成洞察建议'];
  }

  // 计算平均值
  const avgRead = articles.reduce((sum, a) => sum + (a.read || 0), 0) / articles.length;
  const avgPraise = articles.reduce((sum, a) => sum + (a.praise || 0), 0) / articles.length;
  const highReadArticles = articles.filter(a => (a.read || 0) > avgRead * 2);
  const highPraiseArticles = articles.filter(a => (a.praise || 0) > avgPraise * 2);

  // 生成洞察
  if (highReadArticles.length > 0) {
    insights.push('高阅读量文章通常具有吸引眼球的标题，建议学习其标题写法');
  }

  if (highPraiseArticles.length > 0) {
    insights.push('高点赞文章内容质量较高，用户认可度好，值得深入分析');
  }

  // 分析公众号来源
  const wxNamesSet = new Set(articles.map(a => a.wx_name));
  const wechatNames = Array.from(wxNamesSet);
  if (wechatNames.length > 1) {
    insights.push(`多个公众号(${wechatNames.slice(0, 3).join('、')}等)都在关注此话题，说明话题热度较高`);
  }

  // 分析时间分布
  const recentArticles = articles.filter(a => {
    const publishTime = a.publish_time * 1000; // 转换为毫秒
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return publishTime > oneDayAgo;
  });

  if (recentArticles.length > articles.length * 0.5) {
    insights.push('近期文章较多，说明这是当前的热门话题');
  }

  // 添加通用建议
  insights.push('建议结合自身优势，选择差异化的角度进行创作');
  insights.push('关注高互动文章的内容结构和表达方式');

  return insights;
}
