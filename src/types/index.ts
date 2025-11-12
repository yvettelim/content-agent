// 选题分析相关类型
export interface TopicAnalysis {
  id: string;
  keyword: string;
  articleCount: number;
  timeRange: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  totalArticles: number;
  avgEngagementRate: number;
}

export interface Article {
  id: string;
  analysisId: string;
  title: string;
  content: string;
  url?: string;
  author?: string;
  publishTime?: string;
  readCount: number;
  likeCount: number;
  watchCount: number;
  engagementRate: number;
  aiSummary?: string;
  createdAt: string;
}

export interface TopicInsight {
  id: string;
  analysisId: string;
  topLikedArticles: Array<{
    id: string;
    title: string;
    likeCount: number;
  }>;
  topEngagementArticles: Array<{
    id: string;
    title: string;
    engagementRate: number;
  }>;
  wordCloud: Array<{
    word: string;
    count: number;
  }>;
  insights: string[];
  createdAt: string;
}

// 内容创作相关类型
export interface Content {
  id: string;
  title: string;
  content: string;
  insightId?: string;
  customTopic?: string;
  articleLength: number;
  writingStyle: string;
  imageCount: number;
  images: string[];
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// 发布相关类型
export interface PublishRecord {
  id: string;
  contentId: string;
  platform: 'xiaohongshu' | 'wechat';
  platformPostId?: string;
  platformUrl?: string;
  status: 'pending' | 'published' | 'failed';
  errorMessage?: string;
  publishedAt?: string;
  createdAt: string;
}

// 系统配置类型
export interface SystemConfig {
  id: string;
  configKey: string;
  configValue: string;
  description?: string;
  updatedAt: string;
}