import Database from 'better-sqlite3';
import path from 'path';
import { TopicAnalysis, WechatArticle } from '@/types';

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

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_analyses_keyword ON topic_analyses(keyword);
    CREATE INDEX IF NOT EXISTS idx_analyses_status ON topic_analyses(status);
    CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON topic_analyses(created_at);
    CREATE INDEX IF NOT EXISTS idx_articles_analysis_id ON articles(analysis_id);
    CREATE INDEX IF NOT EXISTS idx_articles_title ON articles(title);
    CREATE INDEX IF NOT EXISTS idx_articles_publish_time ON articles(publish_time);
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
    stmt.run(
      crypto.randomUUID(),
      analysisId,
      article.title,
      article.content,
      article.url,
      article.wx_name, // 使用公众号名称作为作者
      article.publish_time_str,
      article.read,
      article.praise,
      article.looking || 0,
      article.read > 0 ? (article.praise + (article.looking || 0)) / article.read * 100 : 0,
      null, // AI摘要暂不生成
      createdAt,
      article.avatar,
      article.classify,
      article.ghid,
      article.ip_wording,
      article.is_original,
      article.looking,
      article.praise,
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
    ORDER BY publish_time DESC
    LIMIT ? OFFSET ?
  `);

  const articles = listStmt.all(analysisId, pageSize, offset) as WechatArticle[];

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
 * 关闭数据库连接
 */
export function closeDatabase() {
  db.close();
}