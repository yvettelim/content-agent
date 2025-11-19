import Database from 'better-sqlite3';
import path from 'path';
import { TopicAnalysis, WechatArticle, AIInsightSuggestion } from '@/types';

// 数据库文件路径
const dbPath = path.join(process.cwd(), 'content-agent.db');

// 创建数据库连接
const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

/**
 * 初始化数据库表结构
 */
export function initDatabase() {
  // 创建选题分析表
  db.exec(`
    CREATE TABLE IF NOT EXISTS topic_analyses (
      id TEXT PRIMARY KEY,
      keyword TEXT NOT NULL,
      article_count INTEGER NOT NULL,
      time_range INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
      created_at TEXT NOT NULL,
      completed_at TEXT,
      total_articles INTEGER DEFAULT 0,
      avg_engagement_rate REAL DEFAULT 0,
      error_message TEXT,
      api_response TEXT -- JSON字符串
    );
  `);

  // 创建文章表
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      url TEXT,
      author TEXT,
      publish_time TEXT,
      read_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      watch_count INTEGER DEFAULT 0,
      engagement_rate REAL DEFAULT 0,
      ai_summary TEXT,
      created_at TEXT NOT NULL,

      -- 公众号特有字段
      avatar TEXT,
      classify TEXT,
      ghid TEXT,
      ip_wording TEXT,
      is_original INTEGER,
      looking INTEGER,
      praise INTEGER,
      publish_time_str TEXT,
      short_link TEXT,
      update_time INTEGER,
      update_time_str TEXT,
      wx_id TEXT,
      wx_name TEXT,

      FOREIGN KEY (analysis_id) REFERENCES topic_analyses (id) ON DELETE CASCADE
    );
  `);

  // 创建洞察报告表
  db.exec(`
    CREATE TABLE IF NOT EXISTS topic_insights (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      top_liked_articles TEXT, -- JSON字符串
      top_engagement_articles TEXT, -- JSON字符串
      word_cloud TEXT, -- JSON字符串
      insights TEXT, -- JSON字符串
      created_at TEXT NOT NULL,

      FOREIGN KEY (analysis_id) REFERENCES topic_analyses (id) ON DELETE CASCADE
    );
  `);

  // 创建AI洞察报告缓存表
  db.exec(`
    CREATE TABLE IF NOT EXISTS insight_reports (
      id TEXT PRIMARY KEY,
      keyword TEXT NOT NULL,
      insights TEXT NOT NULL, -- JSON字符串，包含5条洞察建议
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL, -- 过期时间
      article_count INTEGER NOT NULL, -- 分析的文章数量
      avg_engagement_rate REAL DEFAULT 0, -- 平均互动率
      model_used TEXT DEFAULT 'openai/gpt-4o-mini', -- 使用的模型
      analysis_id TEXT, -- 关联的分析ID（可选）

      FOREIGN KEY (analysis_id) REFERENCES topic_analyses (id) ON DELETE SET NULL
    );
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_analyses_keyword ON topic_analyses(keyword);
    CREATE INDEX IF NOT EXISTS idx_analyses_status ON topic_analyses(status);
    CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON topic_analyses(created_at);
    CREATE INDEX IF NOT EXISTS idx_articles_analysis_id ON articles(analysis_id);
    CREATE INDEX IF NOT EXISTS idx_articles_title ON articles(title);
    CREATE INDEX IF NOT EXISTS idx_articles_publish_time ON articles(publish_time);

    -- 洞察报告缓存表索引
    CREATE INDEX IF NOT EXISTS idx_insight_reports_keyword ON insight_reports(keyword);
    CREATE INDEX IF NOT EXISTS idx_insight_reports_expires_at ON insight_reports(expires_at);
    CREATE INDEX IF NOT EXISTS idx_insight_reports_created_at ON insight_reports(created_at);
  `);

  console.log('数据库初始化完成');
}

/**
 * 保存选题分析记录
 */
export function saveTopicAnalysis(analysis: Omit<TopicAnalysis, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): string {
  const id = analysis.id || crypto.randomUUID();
  const createdAt = analysis.createdAt || new Date().toISOString();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO topic_analyses (
      id, keyword, article_count, time_range, status, created_at,
      completed_at, total_articles, avg_engagement_rate, error_message, api_response
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    analysis.keyword,
    analysis.articleCount,
    analysis.timeRange,
    analysis.status,
    createdAt,
    analysis.completedAt || null,
    analysis.totalArticles,
    analysis.avgEngagementRate,
    analysis.errorMessage || null,
    analysis.apiResponse ? JSON.stringify(analysis.apiResponse) : null
  );

  return id;
}

/**
 * 保存文章数据
 */
export function saveArticles(analysisId: string, articles: WechatArticle[]): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO articles (
      id, analysis_id, title, content, url, author, publish_time,
      read_count, like_count, watch_count, engagement_rate, ai_summary, created_at,
      avatar, classify, ghid, ip_wording, is_original, looking, praise,
      publish_time_str, short_link, update_time, update_time_str, wx_id, wx_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const createdAt = new Date().toISOString();

  articles.forEach(article => {
    const safeRead = typeof article.read === 'number' ? article.read : parseInt(String(article.read || 0), 10) || 0;
    const safePraise = typeof article.praise === 'number' ? article.praise : parseInt(String(article.praise || 0), 10) || 0;
    const safeLooking = typeof article.looking === 'number' ? article.looking : parseInt(String(article.looking || 0), 10) || 0;
    const publishTimestamp = typeof article.publish_time === 'number'
      ? article.publish_time
      : (article.publish_time_str ? Math.floor(new Date(article.publish_time_str).getTime() / 1000) : null);

    stmt.run(
      crypto.randomUUID(),
      analysisId,
      article.title,
      article.content,
      article.url,
      article.wx_name, // 使用公众号名称作为作者
      publishTimestamp ?? null,
      safeRead,
      safePraise,
      safeLooking,
      safeRead > 0 ? ((safePraise + safeLooking) / safeRead) * 100 : 0,
      null, // AI摘要暂不生成
      createdAt,
      article.avatar,
      article.classify,
      article.ghid,
      article.ip_wording,
      article.is_original,
      safeLooking,
      safePraise,
      article.publish_time_str,
      article.short_link,
      article.update_time,
      article.update_time_str,
      article.wx_id,
      article.wx_name
    );
  });
}

/**
 * 获取分析历史记录
 */
export function getAnalysisHistory(
  page: number = 1,
  pageSize: number = 10,
  keyword?: string
): {
  analyses: TopicAnalysis[];
  total: number;
  totalPage: number;
} {
  let whereClause = '';
  const params: any[] = [];

  if (keyword) {
    whereClause = 'WHERE keyword LIKE ?';
    params.push(`%${keyword}%`);
  }

  // 获取总数
  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM topic_analyses ${whereClause}`);
  const countResult = countStmt.get(...params) as { total: number };
  const total = countResult.total;
  const totalPage = Math.ceil(total / pageSize);

  // 获取分页数据
  const offset = (page - 1) * pageSize;
  const listStmt = db.prepare(`
    SELECT
      id, keyword, article_count, time_range, status, created_at,
      completed_at, total_articles, avg_engagement_rate, error_message
    FROM topic_analyses
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);

  const analyses = listStmt.all(...params, pageSize, offset) as TopicAnalysis[];

  return { analyses, total, totalPage };
}

/**
 * 根据ID获取分析详情
 */
export function getAnalysisById(id: string): TopicAnalysis | null {
  const stmt = db.prepare(`
    SELECT * FROM topic_analyses WHERE id = ?
  `);

  const analysis = stmt.get(id) as TopicAnalysis | undefined;

  if (analysis && analysis.apiResponse) {
    try {
      analysis.apiResponse = JSON.parse(analysis.apiResponse as any);
    } catch (error) {
      console.error('解析API响应失败:', error);
    }
  }

  return analysis || null;
}

/**
 * 获取分析相关的文章
 */
export function getArticlesByAnalysisId(
  analysisId: string,
  page: number = 1,
  pageSize: number = 20
): {
  articles: WechatArticle[];
  total: number;
  totalPage: number;
} {
  // 获取总数
  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM articles WHERE analysis_id = ?`);
  const countResult = countStmt.get(analysisId) as { total: number };
  const total = countResult.total;
  const totalPage = Math.ceil(total / pageSize);

  // 获取分页数据
  const offset = (page - 1) * pageSize;
  const listStmt = db.prepare(`
    SELECT * FROM articles
    WHERE analysis_id = ?
    ORDER BY like_count DESC, watch_count DESC, read_count DESC, publish_time DESC, created_at DESC
    LIMIT ? OFFSET ?
  `);

  const dbArticles = listStmt.all(analysisId, pageSize, offset) as Array<WechatArticle & {
    read_count?: number;
    like_count?: number;
    watch_count?: number;
    publish_time?: number | string | null;
  }>;

  const articles: WechatArticle[] = dbArticles.map(article => {
    const numericRead = article.read ?? article.read_count ?? 0;
    const numericPraise = article.praise ?? article.like_count ?? 0;
    const numericLooking = article.looking ?? article.watch_count ?? 0;
    const publishTimeValue = article.publish_time ?? article.publish_time_str;
    const publishTime = typeof publishTimeValue === 'number'
      ? publishTimeValue
      : (publishTimeValue ? Math.floor(new Date(publishTimeValue).getTime() / 1000) : 0);

    return {
      ...article,
      read: numericRead,
      praise: numericPraise,
      looking: numericLooking,
      publish_time: publishTime,
      publish_time_str: article.publish_time_str || (publishTime ? new Date(publishTime * 1000).toISOString() : ''),
    } as WechatArticle;
  });

  return { articles, total, totalPage };
}

/**
 * 删除分析记录及其相关文章
 */
export function deleteAnalysis(id: string): boolean {
  try {
    // 由于设置了外键约束，删除分析时会自动删除相关文章
    const stmt = db.prepare('DELETE FROM topic_analyses WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  } catch (error) {
    console.error('删除分析记录失败:', error);
    return false;
  }
}

/**
 * 保存AI洞察报告到缓存表
 */
export function saveInsightReport(
  keyword: string,
  insights: AIInsightSuggestion[],
  articleCount: number,
  avgEngagementRate: number = 0,
  analysisId?: string,
  modelUsed: string = 'openai/gpt-4o-mini'
): string {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24小时后过期

  const stmt = db.prepare(`
    INSERT INTO insight_reports (
      id, keyword, insights, created_at, expires_at, article_count,
      avg_engagement_rate, model_used, analysis_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    keyword,
    JSON.stringify(insights),
    createdAt,
    expiresAt,
    articleCount,
    avgEngagementRate,
    modelUsed,
    analysisId || null
  );

  return id;
}

/**
 * 获取有效的洞察报告（未过期的）
 */
export function getValidInsightReport(keyword: string): {
  id: string;
  keyword: string;
  insights: AIInsightSuggestion[];
  created_at: string;
  expires_at: string;
  article_count: number;
  avg_engagement_rate: number;
  model_used: string;
} | null {
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    SELECT * FROM insight_reports
    WHERE keyword = ? AND expires_at > ?
    ORDER BY created_at DESC
    LIMIT 1
  `);

  const result = stmt.get(keyword, now) as any;

  if (result) {
    try {
      const parsed = JSON.parse(result.insights);
      return {
        ...result,
        insights: normalizeInsightRecords(parsed)
      };
    } catch (error) {
      console.error('解析洞察建议失败:', error);
      return null;
    }
  }

  return null;
}

/**
 * 强制删除某个关键词的洞察缓存（用于强制刷新）
 */
export function deleteInsightReportsByKeyword(keyword: string): number {
  const stmt = db.prepare('DELETE FROM insight_reports WHERE keyword = ?');
  const result = stmt.run(keyword);
  return result.changes;
}

/**
 * 清理过期的洞察报告
 */
export function cleanupExpiredInsightReports(): number {
  const now = new Date().toISOString();
  const stmt = db.prepare('DELETE FROM insight_reports WHERE expires_at <= ?');
  const result = stmt.run(now);
  return result.changes;
}

function normalizeInsightRecords(raw: unknown): AIInsightSuggestion[] {
  const defaultDataSupport = '聚合文章阅读、点赞、在看、发布时间与账号行业等维度，结合趋势分析与对标方法得出结论。';

  const container = raw && typeof raw === 'object' && !Array.isArray(raw) && 'suggestions' in (raw as any)
    ? (raw as any).suggestions
    : raw;
  const entries = Array.isArray(container) ? container : [];

  return entries.map((item, index) => {
    if (typeof item === 'string') {
      const text = item.trim();
      const title = text.slice(0, 15) || `洞察建议${index + 1}`;
      return {
        title,
        reason: text || '建议关注高表现文章的内容结构和表达方式，优化选题策略。',
        dataSupport: defaultDataSupport,
      };
    }

    const record = item as any;
    const title = (record?.title || record?.name || record?.Title || `洞察建议${index + 1}`).toString().trim().slice(0, 15) || `洞察建议${index + 1}`;
    const reason = (record?.reason || record?.insight || record?.description || '').toString().trim() ||
      '建议结合行业热点，明确内容定位与核心价值，形成差异化叙事。';
    const dataSupport = (record?.dataSupport || record?.data_support || record?.data || '').toString().trim() || defaultDataSupport;

    return {
      title,
      reason,
      dataSupport,
    };
  });
}

/**
 * 关闭数据库连接
 */
export function closeDatabase() {
  db.close();
}
