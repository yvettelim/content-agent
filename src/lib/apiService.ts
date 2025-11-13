import { TopicAnalysis, WechatArticle } from '@/types';

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

// 微信搜索参数
export interface WechatSearchParams {
  kw: string;
  sort_type?: number;
  mode?: number;
  period?: number;
  page?: number;
  any_kw?: string;
  ex_kw?: string;
  verifycode?: string;
  type?: number;
  usePagination?: boolean;
  maxPages?: number;
}

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

/**
 * 搜索公众号文章
 */
export async function searchWechatArticles(params: WechatSearchParams) {
  const response = await fetch('/api/wechat/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('搜索公众号文章失败');
  }

  const result: ApiResponse<any> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '搜索公众号文章失败');
  }

  return result.data;
}