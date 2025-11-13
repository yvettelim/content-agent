import { NextRequest, NextResponse } from 'next/server';
import { searchWechatArticles, getArticlesWithPagination, WechatApiParams } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params: WechatApiParams = body;

    // 验证必要参数
    if (!params.kw) {
      return NextResponse.json({
        success: false,
        error: '缺少关键词参数'
      }, { status: 400 });
    }

    // 根据是否需要分页决定调用哪个方法
    const usePagination = body.usePagination || false;
    const maxPages = body.maxPages || 5;

    const result = usePagination
      ? await getArticlesWithPagination(params, maxPages)
      : await searchWechatArticles(params);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('公众号搜索失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '公众号搜索失败'
    }, { status: 500 });
  }
}