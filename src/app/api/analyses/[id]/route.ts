import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById, getArticlesByAnalysisId, deleteAnalysis } from '@/lib/db';

// 获取单个分析记录详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const analysis = getAnalysisById(id);
    if (!analysis) {
      return NextResponse.json({
        success: false,
        error: '分析记录不存在'
      }, { status: 404 });
    }

    const { articles, total, totalPage } = getArticlesByAnalysisId(id, page, pageSize);

    return NextResponse.json({
      success: true,
      data: { analysis, articles, total, totalPage }
    });
  } catch (error) {
    console.error('获取分析详情失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取分析详情失败'
    }, { status: 500 });
  }
}

// 删除分析记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const success = deleteAnalysis(id);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: '删除失败，记录可能不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除分析记录失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '删除分析记录失败'
    }, { status: 500 });
  }
}