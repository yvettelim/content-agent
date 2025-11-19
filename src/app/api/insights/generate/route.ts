import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getArticlesByAnalysisId, saveInsightReport, getValidInsightReport, deleteInsightReportsByKeyword, cleanupExpiredInsightReports } from '@/lib/db';
import { generateInsightsWithAI, validateOpenRouterConfig, buildFallbackInsightSuggestions } from '@/lib/openrouter';
import { AIInsightSuggestion, TopicAnalysisSections } from '@/types';

// 初始化数据库
initDatabase();

// 生成洞察建议
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, analysisId, forceRefresh = false } = body;

    // 验证必要参数
    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json({
        success: false,
        error: '关键词参数无效或缺失'
      }, { status: 400 });
    }

    // 验证 OpenRouter 配置
    const configValidation = validateOpenRouterConfig();
    if (!configValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: `AI 服务配置错误: ${configValidation.error}`
      }, { status: 500 });
    }

    // 清理过期缓存
    try {
      cleanupExpiredInsightReports();
    } catch (cleanupError) {
      console.warn('清理过期缓存失败:', cleanupError);
    }

    let cachedReport: ReturnType<typeof getValidInsightReport> | null = null;

    if (!forceRefresh) {
      try {
        cachedReport = getValidInsightReport(keyword);
        if (cachedReport) {
          console.log(`使用缓存的洞察报告: ${keyword}`);
        }
      } catch (cacheError) {
        console.warn('读取缓存失败，将重新生成:', cacheError);
      }
    } else {
      // 强制刷新：删除现有缓存
      try {
        const deletedCount = deleteInsightReportsByKeyword(keyword);
        if (deletedCount > 0) {
          console.log(`强制刷新：删除了 ${deletedCount} 条缓存记录`);
        }
      } catch (deleteError) {
        console.warn('删除缓存失败:', deleteError);
      }
    }

    if (!analysisId) {
      return NextResponse.json({
        success: false,
        error: '需要提供 analysisId 来获取文章数据'
      }, { status: 400 });
    }

    let topArticles: any[] = [];
    try {
      const { articles } = getArticlesByAnalysisId(analysisId, 1, 100);
      topArticles = articles;
    } catch (dbError) {
      console.error('从数据库获取文章失败:', dbError);
      return NextResponse.json({
        success: false,
        error: '无法获取分析数据，请检查 analysisId 是否正确'
      }, { status: 404 });
    }

    if (topArticles.length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有找到相关文章数据，无法生成洞察建议'
      }, { status: 404 });
    }

    // 按点赞数排序，取 Top 10
    topArticles.sort((a, b) => (b.praise || 0) - (a.praise || 0));
    const top10Articles = topArticles.slice(0, 10);

    // 计算平均互动率
    const totalRead = top10Articles.reduce((sum, article) => sum + (article.read_count || 0), 0);
    const totalEngagement = top10Articles.reduce((sum, article) => sum + (article.praise || 0) + (article.looking || 0), 0);
    const avgEngagementRate = totalRead > 0 ? (totalEngagement / totalRead) * 100 : 0;

    let insights: AIInsightSuggestion[] = cachedReport?.insights || [];
    let fromCache = Boolean(cachedReport);
    let modelUsed = cachedReport?.model_used || process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    let generatedAt = cachedReport?.created_at || new Date().toISOString();

    if (!insights.length) {
      console.log(`开始为关键词 "${keyword}" 生成 AI 洞察，分析 ${top10Articles.length} 篇文章...`);
      try {
        insights = await generateInsightsWithAI(keyword, top10Articles);
        modelUsed = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
        generatedAt = new Date().toISOString();
        fromCache = false;
      } catch (aiError) {
        console.error('AI 生成洞察失败:', aiError);

        const fallbackArticles = top10Articles.map(article => ({
          title: article.title,
          wx_name: article.wx_name,
          read: article.read || 0,
          praise: article.praise || 0,
          looking: article.looking || 0,
          publish_time_str: article.publish_time_str || ''
        }));
        insights = buildFallbackInsightSuggestions(keyword, fallbackArticles as any);
        modelUsed = 'fallback-rules';
        generatedAt = new Date().toISOString();
        fromCache = false;
        console.log('使用备用规则生成洞察建议');
      }

      // 保存到缓存
      try {
        const reportId = saveInsightReport(
          keyword,
          insights,
          top10Articles.length,
          avgEngagementRate,
          analysisId,
          modelUsed
        );
        console.log(`洞察报告已保存: ${reportId}`);
      } catch (saveError) {
        console.error('保存洞察报告失败:', saveError);
      }
    }

    const topicAnalysis = buildTopicAnalysisSections(keyword, top10Articles, insights);

    return NextResponse.json({
      success: true,
      data: {
        insights,
        topicAnalysis,
        fromCache,
        articleCount: top10Articles.length,
        avgEngagementRate: Number(avgEngagementRate.toFixed(2)),
        modelUsed,
        generatedAt
      }
    });

  } catch (error) {
    console.error('生成洞察建议失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '生成洞察建议失败'
    }, { status: 500 });
  }
}

// 获取缓存的洞察建议
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
      return NextResponse.json({
        success: false,
        error: '关键词参数缺失'
      }, { status: 400 });
    }

    // 清理过期缓存
    try {
      cleanupExpiredInsightReports();
    } catch (cleanupError) {
      console.warn('清理过期缓存失败:', cleanupError);
    }

    // 检查缓存
    const cachedReport = getValidInsightReport(keyword);
    if (!cachedReport) {
      return NextResponse.json({
        success: false,
        error: '未找到有效的洞察缓存，请先生成洞察建议'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        insights: cachedReport.insights,
        fromCache: true,
        createdAt: cachedReport.created_at,
        expiresAt: cachedReport.expires_at,
        articleCount: cachedReport.article_count,
        avgEngagementRate: cachedReport.avg_engagement_rate,
        modelUsed: cachedReport.model_used
      }
    });

  } catch (error) {
    console.error('获取洞察缓存失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取洞察缓存失败'
    }, { status: 500 });
  }
}

function buildTopicAnalysisSections(
  keyword: string,
  articles: Array<{
    title?: string;
    content?: string;
    digest?: string;
    wx_name?: string;
    read?: number;
    praise?: number;
    looking?: number;
    publish_time?: number;
    publish_time_str?: string;
  }>,
  suggestions: AIInsightSuggestion[]
): TopicAnalysisSections {
  return {
    trendsAndDirections: deriveTrendInsights(keyword, articles),
    userPainPoints: derivePainPoints(keyword, articles),
    highFrequencyKeywords: extractTopKeywords(articles, 8),
    contentStructurePatterns: deriveContentStructureInsights(articles),
    highEngagementTraits: deriveHighEngagementInsights(articles),
    reusableTopicSuggestions: suggestions,
  };
}

function deriveTrendInsights(
  keyword: string,
  articles: Array<{ wx_name?: string; read?: number; praise?: number; publish_time?: number; publish_time_str?: string }>
): string[] {
  if (articles.length === 0) {
    return [`暂无关于「${keyword}」的趋势数据，等待新的分析任务。`];
  }

  const now = Date.now();
  const withinDays = (days: number) =>
    articles.filter(article => {
      const publishMs = resolvePublishTime(article);
      return publishMs && now - publishMs <= days * 24 * 60 * 60 * 1000;
    }).length;

  const within7 = withinDays(7);
  const within30 = withinDays(30);
  const uniqueAccounts = new Set(articles.map(article => article.wx_name).filter(Boolean));
  const totalRead = articles.reduce((sum, article) => sum + (article.read || 0), 0);
  const totalPraise = articles.reduce((sum, article) => sum + (article.praise || 0), 0);
  const avgRead = articles.length > 0 ? Math.round(totalRead / articles.length) : 0;
  const avgPraise = articles.length > 0 ? Math.round(totalPraise / articles.length) : 0;

  const statements: string[] = [];

  if (within7 > 0) {
    statements.push(`最近7天共 ${within7} 篇文章聚焦「${keyword}」，热度正处于活跃区间。`);
  } else if (within30 > 0) {
    statements.push(`最近30天累计 ${within30} 篇内容提及「${keyword}」，话题持续发酵。`);
  }

  if (uniqueAccounts.size > 0) {
    statements.push(`共有 ${uniqueAccounts.size} 个公众号参与输出，说明竞争者正在加速布局 ${keyword} 相关内容。`);
  }

  statements.push(`平均阅读 ${formatNumber(avgRead)}，平均点赞 ${formatNumber(avgPraise)}，适合通过深度内容持续放大声量。`);

  return statements;
}

function derivePainPoints(
  keyword: string,
  articles: Array<{ title?: string; digest?: string; content?: string }>
): string[] {
  const painIndicators = [
    '效率', '成本', '转化', '流量', '涨粉', '焦虑', '竞争', '信任', '运营', '引流',
    '落地', '实操', '投入', '体验', '变现', '对比', '策略', '工具', '爆款', '风险'
  ];
  const painMap = new Map<string, number>();

  articles.forEach(article => {
    const text = `${article.title || ''}${article.digest || ''}${(article.content || '').slice(0, 200)}`;
    painIndicators.forEach(indicator => {
      if (text.includes(indicator)) {
        painMap.set(indicator, (painMap.get(indicator) || 0) + 1);
      }
    });
  });

  if (painMap.size === 0) {
    return [
      `读者更关注「${keyword}」的真实落地案例与可复用方法论，适合从“问题-解决方案-效果”结构切入。`,
    ];
  }

  const topPain = Array.from(painMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return topPain.map(([word, count]) =>
    `关于「${word}」的讨论出现 ${count} 次，说明用户迫切需要解决相关痛点，可结合实测数据或案例拆解。`
  );
}

function extractTopKeywords(
  articles: Array<{ title?: string; content?: string; digest?: string }>,
  limit: number = 8
): string[] {
  const stopWords = new Set([
    '我们', '你们', '他们', '以及', '但是', '所以', '然后', '不是', '自己', '大家', '所有', '这个', '那个',
    '为了', '觉得', '可以', '已经', '不会', '还是', '这种', '这些', '那些', '针对', '关于', '就是', '因为',
    '如果', '如何', '或者', '一些', '很多', '需要', '拥有', '一个', '两个', '三个', '第一', '第二', '第三',
    '提升', '发展', '通过', '进行', '打造', '发现', '选择', '关注', '了解', '分享', '文章', '公众号', '微信',
  ]);

  const keywordMap = new Map<string, number>();

  articles.forEach(article => {
    const text = `${article.title || ''} ${(article.content || '').slice(0, 200)} ${article.digest || ''}`;
    const tokens = text.match(/[\u4e00-\u9fa5]{2,4}|[A-Za-z]{3,}/g) || [];
    tokens.forEach(token => {
      if (!stopWords.has(token)) {
        keywordMap.set(token, (keywordMap.get(token) || 0) + 1);
      }
    });
  });

  return Array.from(keywordMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function deriveContentStructureInsights(
  articles: Array<{ title?: string }>
): string[] {
  if (articles.length === 0) return ['暂无内容结构样本'];

  const total = articles.length;
  const hasNumber = articles.filter(article => /\d/.test(article.title || '')).length;
  const colonTitles = articles.filter(article => /[:：]/.test(article.title || '')).length;
  const questionTitles = articles.filter(article => /(？|\?)/.test(article.title || '') || (article.title || '').includes('如何')).length;
  const listWords = ['方法', '步骤', '清单', '案例', '指南', '秘籍', '避坑', '拆解'];
  const listStyle = articles.filter(article =>
    listWords.some(word => (article.title || '').includes(word))
  ).length;

  const statements: string[] = [];

  if (hasNumber / total >= 0.3) {
    statements.push(`约 ${formatPercent(hasNumber, total)} 的标题包含数字或序号，读者偏好“步骤/清单”类结构。`);
  }

  if (listStyle / total >= 0.25) {
    statements.push(`“${listWords.slice(0, 4).join('、') }”等词频繁出现，结构上倾向于可执行的清单或对比。`);
  }

  if (colonTitles / total >= 0.2) {
    statements.push(`不少作者使用「主题：副标题」的双层标题格式，方便突出场景或结果。`);
  }

  if (questionTitles / total >= 0.2) {
    statements.push(`问句型标题占比 ${formatPercent(questionTitles, total)}，适合通过“问题-答案”展开叙事。`);
  }

  if (statements.length === 0) {
    statements.push('内容普遍采用直陈式标题，可结合数据故事或案例拆解提升层次。');
  }

  return statements;
}

function deriveHighEngagementInsights(
  articles: Array<{ title?: string; wx_name?: string; read?: number; praise?: number; looking?: number }>
): string[] {
  if (articles.length === 0) return ['暂无互动数据'];

  const withRate = articles
    .map(article => {
      const read = article.read || 0;
      const engagement = read > 0 ? ((article.praise || 0) + (article.looking || 0)) / read * 100 : 0;
      return { ...article, engagementRate: engagement };
    })
    .filter(item => item.engagementRate > 0);

  if (withRate.length === 0) {
    return ['互动数据不足，建议后续采集点赞/在看指标。'];
  }

  const avgRate = withRate.reduce((sum, item) => sum + item.engagementRate, 0) / withRate.length;
  const highEngagement = withRate
    .filter(item => item.engagementRate >= avgRate * 1.1 || item.engagementRate >= 3)
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 3);

  const statements: string[] = [];

  if (highEngagement.length > 0) {
    const accounts = Array.from(new Set(highEngagement.map(item => item.wx_name).filter(Boolean)));
    statements.push(`高互动样本平均互动率 ${avgRate.toFixed(1)}%，头部账号如 ${accounts.slice(0, 2).join('、')} 表现突出。`);

    const keywords = extractTopKeywords(highEngagement, 5);
    if (keywords.length > 0) {
      statements.push(`高互动标题常见关键词：${keywords.join('、')}，可在选题时优先结合这些元素。`);
    }
  } else {
    statements.push('互动率整体平稳，建议结合对比实验或真实案例提升参与度。');
  }

  return statements;
}

function resolvePublishTime(article: { publish_time?: number; publish_time_str?: string }): number | null {
  if (typeof article.publish_time === 'number') {
    // publish_time 可能是秒或毫秒
    return article.publish_time > 1e12 ? article.publish_time : article.publish_time * 1000;
  }
  if (article.publish_time_str) {
    const ts = Date.parse(article.publish_time_str);
    if (!Number.isNaN(ts)) return ts;
  }
  return null;
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toLocaleString('zh-CN');
}

function formatPercent(count: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((count / total) * 100)}%`;
}
