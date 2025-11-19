// 公众号API响应类型
export interface WechatApiResponse {
  code: number;
  cost_money: number;
  cut_words: string;
  data: WechatArticle[];
  data_number: number;
  msg: string;
  page: number;
  remain_money: number;
  total: number;
  total_page: number;
  [property: string]: any;
}

export interface WechatArticle {
  /** 封面 */
  avatar: string;
  /** 分类 */
  classify: string;
  /** 正文 */
  content: string;
  /** 原始id */
  ghid: string;
  /** 发布地址 */
  ip_wording: string;
  /** 是否原创 */
  is_original: number;
  /** 再看数 */
  looking: number;
  /** 点赞数 */
  praise: number;
  /** 发布时间 */
  publish_time: number;
  publish_time_str: string;
  /** 阅读数 */
  read: number;
  /** 文章原始短链接 */
  short_link: string;
  /** 文章标题 */
  title: string;
  /** 更新时间 */
  update_time: number;
  update_time_str: string;
  /** 文章长连接 */
  url: string;
  /** wxid */
  wx_id: string;
  /** 公众号名字 */
  wx_name: string;
  [property: string]: any;
}

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
  errorMessage?: string;
  apiResponse?: WechatApiResponse;
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

  // 公众号特有字段
  avatar?: string;
  classify?: string;
  ghid?: string;
  ip_wording?: string;
  is_original?: number;
  looking?: number;
  praise?: number;
  publish_time?: number;
  publish_time_str?: string;
  short_link?: string;
  update_time?: number;
  update_time_str?: string;
  wx_id?: string;
  wx_name?: string;
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

export interface AIInsightSuggestion {
  title: string;
  reason: string;
  dataSupport: string;
}

export interface TopicAnalysisSections {
  trendsAndDirections: string[];
  userPainPoints: string[];
  highFrequencyKeywords: string[];
  contentStructurePatterns: string[];
  highEngagementTraits: string[];
  reusableTopicSuggestions: AIInsightSuggestion[];
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
