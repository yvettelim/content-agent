import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, saveTopicAnalysis, saveArticles, getAnalysisHistory, getAnalysisById, getArticlesByAnalysisId, deleteAnalysis } from '@/lib/db';

// 初始化数据库
initDatabase();

// 获取分析历史记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const keyword = searchParams.get('keyword') || '';

    const result = getAnalysisHistory(page, pageSize, keyword);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取分析历史失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取分析历史失败'
    }, { status: 500 });
  }
}

// 创建新的分析记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysis, articles } = body;

    if (!analysis || !articles) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 });
    }

    // 保存分析记录
    const analysisId = saveTopicAnalysis(analysis);

    // 保存文章数据
    if (articles.length > 0) {
      saveArticles(analysisId, articles);
    }

    return NextResponse.json({
      success: true,
      data: { analysisId }
    });
  } catch (error) {
    console.error('保存分析记录失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '保存分析记录失败'
    }, { status: 500 });
  }
}