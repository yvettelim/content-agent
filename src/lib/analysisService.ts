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
      sort_type: 1, // 按时间排序
      mode: 1,      // 普通模式
      period: config.timeRange,
      page: 1,
      any_kw: config.includeAnyKeywords || '',
      ex_kw: config.excludeKeywords || '',
      type: 1,      // 文章类型
    };

    // 计算需要获取的页数（每页默认20条，API返回）
    const maxPages = Math.min(Math.ceil(config.articleCount / 20), config.maxPages || 10);

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

    // 计算平均互动率
    const avgEngagementRate = calculateAvgEngagementRate(processedArticles);

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
      totalArticles: processedArticles.length,
      avgEngagementRate,
      apiResponse,
    };

    // 保存最终结果
    await saveAnalysis(completedAnalysis, processedArticles);

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

    return { analysis: finalAnalysis, articles: processedArticles };

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
    return {
      ...article,
      // 确保必要字段存在
      read: article.read || 0,
      praise: article.praise || 0,
      looking: article.looking || 0,
    };
  });
}

/**
 * 计算单篇文章的互动率
 */
function calculateEngagementRate(article: WechatArticle): number {
  const read = article.read || 0;
  const praise = article.praise || 0;
  const looking = article.looking || 0;

  if (read === 0) return 0;
  return ((praise + looking) / read) * 100;
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
export function generateInsightReport(articles: WechatArticle[]) {
  if (articles.length === 0) {
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

  // 按点赞数排序
  const topLikedArticles = articles
    .sort((a, b) => (b.praise || 0) - (a.praise || 0))
    .slice(0, 5)
    .map(article => ({
      id: article.title,
      title: article.title,
      likeCount: article.praise || 0,
    }));

  // 按互动率排序
  const topEngagementArticles = articles
    .map(article => {
      const engagementRate = calculateEngagementRate(article);
      return {
        ...article,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
      };
    })
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 5)
    .map(article => ({
      id: article.title,
      title: article.title,
      engagementRate: article.engagementRate,
    }));

  // 生成词云数据（简单的词频统计）
  const wordCloud = generateWordCloud(articles);

  // 生成洞察建议
  const insights = generateInsights(articles);

  // 计算阅读量分布
  const readCountDistribution = calculateReadCountDistribution(articles);

  // 计算发布时间分布
  const publishTimeDistribution = calculatePublishTimeDistribution(articles);

  // 计算统计摘要
  const summary = {
    totalArticles: articles.length,
    avgEngagementRate: calculateAvgEngagementRate(articles),
    avgReadCount: Math.round(articles.reduce((sum, a) => sum + (a.read || 0), 0) / articles.length),
    avgPraiseCount: Math.round(articles.reduce((sum, a) => sum + (a.praise || 0), 0) / articles.length),
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
function generateWordCloud(articles: WechatArticle[]) {
  // 简单的词频统计，实际应用中可以使用更复杂的分词算法
  const allTitles = articles.map(a => a.title).join(' ');
  const words = allTitles.match(/[\u4e00-\u9fa5]{2,}/g) || [];

  // 无关词汇列表
  const stopWords = new Set([
    // 无关词汇
    '点击', '即可', '订阅', '但是', '可以', '不过', '而且', '或者', '还有', '已经',
    '非常', '特别', '真正', '确实', '当然', '其实', '不过', '只是', '不要',
    '需要', '应该', '能够', '可能', '一定', '必须', '将会', '已经', '正在',
    '进行', '开始', '结束', '完成', '实现', '达到', '获得', '取得', '得到',
    '做好', '用好', '发挥', '提供', '包含', '包括', '关于', '对于', '针对',
    '根据', '基于', '通过', '由于', '因为', '所以', '因此', '然而', '但是',
    '这种', '这些', '那些', '他们', '我们', '你们', '自己', '大家', '别人',
    '人们', '用户', '消费者', '客户', '读者', '观众', '用户们', '各位',
    '第', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万',
    '个', '家', '种', '类', '样', '式', '法', '式', '方法', '方式', '类型',
    '工作', '时间', '机会', '发展', '提高', '增加', '减少', '降低', '改善',
    '优化', '升级', '更新', '创新', '突破', '成功', '失败', '问题', '挑战',
    '机会', '风险', '优势', '劣势', '特点', '特色', '亮点', '要点', '重点',
    '基础', '基本', '重要', '关键', '核心', '主要', '次要', '额外', '其他',
    '不同', '各种', '多种', '许多', '很多', '少', '最', '更', '比较', '相对',
    '绝对', '完全', '彻底', '深入', '广泛', '全面', '整体', '部分', '局部',
    '详细', '具体', '一般', '通常', '普通', '特别', '特殊', '独特', '专属',
    '独家', '专业', '全面', '系统', '完整', '准确', '正确', '及时', '快速',
    '高效', '优质', '先进', '领先', '顶尖', '第一', '最佳', '最好', '优秀',
    '良好', '正常', '合理', '适当', '合适', '正确', '准确', '精确', '精细'
  ]);

  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    // 跳过单个字和停用词
    if (word.length < 2 || stopWords.has(word)) return;

    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // 排序并过滤掉出现次数少于2次的词，取前20个高频词
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count >= 2)
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
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