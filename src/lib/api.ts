import { WechatApiResponse } from '@/types';

// API配置
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_WECHAT_API_URL || 'https://www.dajiala.com/fbmain/monitor/v3/kw_search',
  apiKey: process.env.NEXT_PUBLIC_WECHAT_API_KEY || '',
};

// API请求参数接口
export interface WechatApiParams {
  kw: string;              // 关键词
  sort_type?: number;      // 排序类型：1-时间，2-热度，默认1
  mode?: number;          // 模式：1-普通，2-高级，默认1
  period?: number;        // 时间范围：7,30,90，默认7
  page?: number;          // 页码，默认1
  any_kw?: string;        // 包含任意关键词
  ex_kw?: string;         // 排除关键词
  verifycode?: string;    // 验证码
  type?: number;          // 类型：1-文章，默认1
}

/**
 * 调用公众号搜索API
 */
export async function searchWechatArticles(params: WechatApiParams): Promise<WechatApiResponse> {
  try {
    const requestData = {
      ...params,
      key: API_CONFIG.apiKey,
      sort_type: params.sort_type || 1,
      mode: params.mode || 1,
      period: params.period || 7,
      page: params.page || 1,
      any_kw: params.any_kw || '',
      ex_kw: params.ex_kw || '',
      verifycode: params.verifycode || '',
      type: params.type || 1,
    };

    const response = await fetch(API_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data: WechatApiResponse = await response.json();

    // 检查API响应状态
    if (data.code !== 0) {
      throw new Error(`API错误: ${data.msg || '未知错误'}`);
    }

    return data;
  } catch (error) {
    console.error('公众号API调用失败:', error);
    throw error;
  }
}

/**
 * 分页获取文章数据
 */
export async function getArticlesWithPagination(
  params: WechatApiParams,
  maxPages: number = 5,
  articlesPerPage: number = 20
): Promise<WechatApiResponse> {
  const allArticles: any[] = [];
  let currentPage = params.page || 1;
  let totalArticles = 0;
  let totalPage = 1;

  for (let page = currentPage; page <= currentPage + maxPages - 1 && page <= totalPage; page++) {
    try {
      const response = await searchWechatArticles({
        ...params,
        page,
      });

      // 合并文章数据
      allArticles.push(...response.data);

      // 更新总数信息
      totalArticles = response.total;
      totalPage = response.total_page;

      // 如果没有更多数据，提前结束
      if (response.data.length === 0 || page >= response.total_page) {
        break;
      }

      // 添加延迟避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`获取第${page}页数据失败:`, error);
      // 继续获取下一页，不中断整个流程
    }
  }

  // 返回合并后的结果
  return {
    code: 0,
    cost_money: 0,
    cut_words: '',
    data: allArticles,
    data_number: allArticles.length,
    msg: 'success',
    page: currentPage,
    remain_money: 0,
    total: totalArticles,
    total_page: totalPage,
  };
}