import { TopicAnalysis, WechatArticle, AIInsightSuggestion, TopicAnalysisSections } from '@/types';

// API响应类型
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分析历史响应类型
interface AnalysisHistoryResponse {
  analyses: TopicAnalysis[];
  total: number;
  totalPage: number;
}

// 分析详情响应类型
interface AnalysisDetailResponse {
  analysis: TopicAnalysis;
  articles: WechatArticle[];
  total: number;
  totalPage: number;
}

// 旧的微信搜索参数已移除，使用新的getso API

/**
 * 获取分析历史记录
 */
export async function fetchAnalysisHistory(
  page: number = 1,
  pageSize: number = 10,
  keyword: string = ''
): Promise<AnalysisHistoryResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    ...(keyword && { keyword }),
  });

  const response = await fetch(`/api/analyses?${params}`);

  if (!response.ok) {
    throw new Error('获取分析历史失败');
  }

  const result: ApiResponse<AnalysisHistoryResponse> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '获取分析历史失败');
  }

  return result.data;
}

/**
 * 获取单个分析记录详情
 */
export async function fetchAnalysisDetail(
  id: string,
  page: number = 1,
  pageSize: number = 20
): Promise<AnalysisDetailResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  const response = await fetch(`/api/analyses/${id}?${params}`);

  if (!response.ok) {
    throw new Error('获取分析详情失败');
  }

  const result: ApiResponse<AnalysisDetailResponse> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '获取分析详情失败');
  }

  return result.data;
}

/**
 * 保存分析记录
 */
export async function saveAnalysis(
  analysis: Omit<TopicAnalysis, 'id' | 'createdAt'>,
  articles: WechatArticle[]
): Promise<{ analysisId: string }> {
  const response = await fetch('/api/analyses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ analysis, articles }),
  });

  if (!response.ok) {
    throw new Error('保存分析记录失败');
  }

  const result: ApiResponse<{ analysisId: string }> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '保存分析记录失败');
  }

  return result.data;
}

/**
 * 删除分析记录
 */
export async function deleteAnalysis(id: string): Promise<boolean> {
  const response = await fetch(`/api/analyses/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('删除分析记录失败');
  }

  const result: ApiResponse<unknown> = await response.json();
  return result.success;
}

// 旧的搜索公众号文章API已移除，使用新的getso API

// 新API采集参数接口
export interface NewApiCollectionParams {
  wxid?: string;          // 公众号ID (可选)
  keyword?: string;       // 搜索关键词 (可选，与wxid二选一)
  articleCount?: 10 | 20 | 50 | 100; // 采集文章数量，默认20
  enableContentCollection?: boolean; // 是否采集文章内容，默认true
  enableRankCollection?: boolean; // 是否采集互动数据，默认true
  batchSize?: number;     // 批次大小，默认10
  batchDelay?: number;    // 批次延迟(ms)，默认500
}

/**
 * 新版公众号文章采集API
 */
export async function collectWechatArticles(params: NewApiCollectionParams) {
  const response = await fetch('/api/wechat/collect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('采集公众号文章失败');
  }

  const result: ApiResponse<any> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '采集公众号文章失败');
  }

  return result.data;
}

// AI 洞察建议
export interface InsightGenerationResult {
  insights: AIInsightSuggestion[];
  topicAnalysis: TopicAnalysisSections;
  fromCache: boolean;
  articleCount: number;
  avgEngagementRate: number;
  modelUsed: string;
  generatedAt?: string;
}

export async function fetchInsightSuggestions(params: {
  keyword: string;
  analysisId: string;
  forceRefresh?: boolean;
}): Promise<InsightGenerationResult> {
  const response = await fetch('/api/insights/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      keyword: params.keyword,
      analysisId: params.analysisId,
      forceRefresh: params.forceRefresh ?? false,
    }),
  });

  const result: ApiResponse<InsightGenerationResult> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || '获取AI洞察建议失败');
  }

  return result.data;
}
