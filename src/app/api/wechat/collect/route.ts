import { NextRequest, NextResponse } from 'next/server';
import { collectArticlesData, searchAccounts } from '@/lib/newApiService';
import { batchConvertArticles, extractAccountInfo, calculateCollectionStats } from '@/lib/dataConverter';

const allowedArticleCounts = new Set([10, 20, 50, 100]);

function normalizeArticleCount(value?: unknown): 10 | 20 | 50 | 100 {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : value;
  if (typeof parsed === 'number' && allowedArticleCounts.has(parsed)) {
    return parsed as 10 | 20 | 50 | 100;
  }
  return 20;
}

function normalizeNumber(value: unknown, fallback: number): number {
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      wxid,
      keyword,
      articleCount,
      batchSize,
      batchDelay,
      enableContentCollection,
      enableRankCollection,
      options = {}
    } = body;

    // 验证必要参数
    if (!wxid && !keyword) {
      return NextResponse.json({
        success: false,
        error: '请提供公众号ID或关键词'
      }, { status: 400 });
    }

    // 默认采集配置，支持顶层或options字段配置
    const collectionOptions = {
      articleCount: normalizeArticleCount(articleCount ?? options.articleCount),
      batchSize: normalizeNumber(batchSize ?? options.batchSize, 10),
      batchDelay: normalizeNumber(batchDelay ?? options.batchDelay, 500),
      enableContentCollection: normalizeBoolean(
        enableContentCollection ?? options.enableContentCollection,
        true
      ),
      enableRankCollection: normalizeBoolean(
        enableRankCollection ?? options.enableRankCollection,
        true
      ),
    };

    let targetWxid = wxid;

    // 如果提供的是关键词，先搜索公众号
    if (keyword && !wxid) {
      console.log(`搜索公众号: ${keyword}`);
      try {
        const searchResult = await searchAccounts({
          key: process.env.NEXT_PUBLIC_NEW_WECHAT_API_KEY || '',
          keyword,
        });

        if (searchResult.data.length === 0) {
          return NextResponse.json({
            success: false,
            error: '未找到匹配的公众号'
          }, { status: 404 });
        }

        // 使用第一个搜索结果
        targetWxid = searchResult.data[0].wx_user;
        console.log(`找到公众号: ${searchResult.data[0].wx_name} (${targetWxid})`);
      } catch (error) {
        console.error('搜索公众号失败:', error);
        return NextResponse.json({
          success: false,
          error: '搜索公众号失败'
        }, { status: 500 });
      }
    }

    // 开始采集文章数据
    console.log(`开始采集公众号文章: ${targetWxid}`);
    const startTime = Date.now();

    const newArticlesData = await collectArticlesData(targetWxid, collectionOptions);

    // 转换为现有系统格式
    const articles = batchConvertArticles(newArticlesData);

    // 提取公众号信息
    const accountInfo = extractAccountInfo(newArticlesData);

    // 计算采集统计
    const stats = calculateCollectionStats(newArticlesData);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`采集完成: ${articles.length} 篇文章，耗时 ${duration} 秒`);

    // 模拟旧API格式，保持兼容性
    const legacyResponse = {
      code: 0,
      msg: 'success',
      cost_money: 0,
      remain_money: 0,
      cut_words: keyword || '',
      data: articles,
      data_number: articles.length,
      page: 1,
      total: articles.length,
      total_page: 1,
      // 新增字段
      accountInfo,
      collectionStats: stats,
      duration: `${duration}s`,
      apiVersion: 'new', // 标识使用新API
    };

    return NextResponse.json({
      success: true,
      data: legacyResponse,
      message: `成功采集 ${articles.length} 篇文章`,
    });
  } catch (error) {
    console.error('公众号文章采集失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '公众号文章采集失败'
    }, { status: 500 });
  }
}
