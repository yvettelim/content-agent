import {
  NEW_API_CONFIG,
  GetPostListParams,
  GetPostListResponse,
  GetArticleInfoParams,
  GetArticleInfoResponse,
  GetArticleRankParams,
  GetArticleRankResponse,
  SearchAccountParams,
  SearchAccountResponse,
  GetSearchArticleListParams,
  GetSearchArticleListResponse,
  SearchArticleItem,
  CollectionOptions,
  CompleteArticleData
} from './newApiTypes';

// 重新导出 CollectionOptions 以供其他模块使用
export type { CollectionOptions };

/**
 * 接口1: 获取公众号文章列表
 */
export async function getPostList(params: GetPostListParams): Promise<GetPostListResponse> {
  try {
    const response = await fetch(`${NEW_API_CONFIG.baseUrl}/getps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: params.key,
        wxid: params.wxid,
        cursor: params.cursor || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`获取文章列表失败: ${response.status} ${response.statusText}`);
    }

    const data: GetPostListResponse = await response.json();

    if (data.code !== 0) {
      throw new Error(`API错误: ${data.msg || '未知错误'}`);
    }

    return data;
  } catch (error) {
    console.error('获取文章列表失败:', error);
    throw error;
  }
}

/**
 * 接口2: 获取文章详细内容
 */
export async function getArticleInfo(params: GetArticleInfoParams): Promise<GetArticleInfoResponse> {
  try {
    // 获取请求URL - 统一使用相对路径，Next.js会自动处理
    const url = '/api/wechat/article-info';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: params.url,
      }),
    });

    if (!response.ok) {
      throw new Error(`获取文章详情失败: ${response.status} ${response.statusText}`);
    }

    const data: GetArticleInfoResponse = await response.json();

    if (data.code !== 0) {
      throw new Error(`API错误: ${data.msg || '未知错误'}`);
    }

    return data;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    throw error;
  }
}

/**
 * 接口3: 获取文章互动数据
 */
export async function getArticleRank(params: GetArticleRankParams): Promise<GetArticleRankResponse> {
  try {
    // 获取请求URL - 统一使用相对路径，Next.js会自动处理
    const url = '/api/wechat/article-rank';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: params.url,
        comment_id: params.comment_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`获取文章互动数据失败: ${response.status} ${response.statusText}`);
    }

    const data: GetArticleRankResponse = await response.json();

    if (data.code !== 0) {
      throw new Error(`API错误: ${data.msg || '未知错误'}`);
    }

    return data;
  } catch (error) {
    console.error('获取文章互动数据失败:', error);
    throw error;
  }
}

/**
 * 搜索公众号
 */
export async function searchAccounts(params: SearchAccountParams): Promise<SearchAccountResponse> {
  try {
    const url = new URL(`${NEW_API_CONFIG.baseUrl}/getsu`);
    url.searchParams.append('key', params.key);
    url.searchParams.append('keyword', params.keyword);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`搜索公众号失败: ${response.status} ${response.statusText}`);
    }

    const data: SearchAccountResponse = await response.json();

    if (data.code !== 0) {
      throw new Error(`API错误: ${data.msg || '未知错误'}`);
    }

    return data;
  } catch (error) {
    console.error('搜索公众号失败:', error);
    throw error;
  }
}

/**
 * 新接口: 搜一搜文章列表
 */
export async function searchArticleList(params: GetSearchArticleListParams): Promise<GetSearchArticleListResponse> {
  try {
    const url = new URL('/api/wechat/search', window.location.origin);
    url.searchParams.append('keyword', params.keyword);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`搜一搜文章失败: ${response.status} ${response.statusText}`);
    }

    const data: GetSearchArticleListResponse = await response.json();

    if (data.code !== 0) {
      throw new Error(`API错误: ${data.msg || '未知错误'}`);
    }

    return data;
  } catch (error) {
    console.error('搜一搜文章失败:', error);
    throw error;
  }
}

/**
 * 延迟函数
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 分批并行采集文章数据
 * 实现两阶段采集策略：
 * 阶段1: 获取文章基础列表
 * 阶段2: 并行采集文章详情和互动数据
 */
export async function collectArticlesData(
  wxid: string,
  options: CollectionOptions = {
    articleCount: 20,
    batchSize: 10,
    batchDelay: 500,
    enableContentCollection: true,
    enableRankCollection: true,
  }
): Promise<CompleteArticleData[]> {
  const { key } = NEW_API_CONFIG;
  console.log('NEW_API_CONFIG:', NEW_API_CONFIG);
  console.log('API key:', key);
  if (!key) {
    throw new Error('API密钥未配置');
  }

  console.log(`开始采集公众号文章数据: ${wxid}, 目标数量: ${options.articleCount}`);

  // 阶段1: 获取文章基础列表
  console.log('阶段1: 获取文章基础列表...');
  const basicArticles: GetPostListResponse['data']['list'] = [];
  let cursor = '';
  let pageCount = 0;

  while (basicArticles.length < options.articleCount && pageCount < 10) { // 最多获取10页，防止无限循环
    try {
      const response = await getPostList({ key, wxid, cursor });

      // 添加到文章列表
      basicArticles.push(...response.data.list);
      cursor = response.data.cursor;
      pageCount++;

      console.log(`已获取 ${basicArticles.length} 篇文章基础信息`);

      // 如果已经够了或者没有更多数据，停止
      if (basicArticles.length >= options.articleCount || response.data.list.length === 0) {
        break;
      }

      // 添加延迟
      await delay(200);
    } catch (error) {
      console.error(`获取第${pageCount + 1}页文章失败:`, error);
      break;
    }
  }

  // 截取到需要的数量
  const targetArticles = basicArticles.slice(0, options.articleCount);
  console.log(`阶段1完成，共获取 ${targetArticles.length} 篇文章`);

  // 阶段2: 并行采集详细信息
  console.log('阶段2: 开始并行采集详细信息...');
  const completeArticles: CompleteArticleData[] = targetArticles.map(article => ({
    basicInfo: article,
    collectionStatus: {
      basicCollected: true,
      detailCollected: false,
      rankCollected: false,
      errors: [],
    },
  }));

  // 分批处理
  for (let i = 0; i < completeArticles.length; i += options.batchSize) {
    const batch = completeArticles.slice(i, i + options.batchSize);
    console.log(`处理批次 ${Math.floor(i / options.batchSize) + 1}/${Math.ceil(completeArticles.length / options.batchSize)}`);

    // 为每批文章并行采集详细信息
    const batchPromises = batch.map(async (article, index) => {
      const articleIndex = i + index;
      try {
        // 先获取详情
        const detailResponse = options.enableContentCollection
          ? await getArticleInfo({ key, url: article.basicInfo.art_url })
          : null;

        // 处理详情数据
        if (detailResponse) {
          article.detailInfo = detailResponse.data;
          article.accountInfo = {
            name: detailResponse.data.name,
            user_name: detailResponse.data.user_name,
            signature: detailResponse.data.signature,
            headImgUrl: detailResponse.data.hd_head_img,
          };
          article.collectionStatus.detailCollected = true;
        }

        // 如果需要采集互动数据
        if (options.enableRankCollection && detailResponse?.data.comment_id) {
          try {
            const rankResponse = await getArticleRank({
              key,
              url: article.basicInfo.art_url,
              comment_id: detailResponse.data.comment_id,
            });

            if (rankResponse) {
              article.rankInfo = rankResponse.data;
              article.collectionStatus.rankCollected = true;
            }
          } catch (rankError) {
            article.collectionStatus.errors.push('互动数据采集失败');
            console.error('互动数据采集失败:', rankError);
          }
        } else if (options.enableRankCollection && !detailResponse?.data.comment_id) {
          article.collectionStatus.errors.push('无法获取comment_id，跳过互动数据采集');
        }

        console.log(`文章 ${articleIndex + 1}/${completeArticles.length} 采集完成: ${article.basicInfo.title}`);
      } catch (error) {
        const errorMsg = `文章采集失败: ${error instanceof Error ? error.message : '未知错误'}`;
        article.collectionStatus.errors.push(errorMsg);
        console.error(`文章 ${articleIndex + 1} 采集失败:`, error);
      }
    });

    // 等待当前批次完成
    await Promise.all(batchPromises);

    // 批次间延迟
    if (i + options.batchSize < completeArticles.length) {
      await delay(options.batchDelay);
    }
  }

  console.log('采集完成！');
  return completeArticles;
}

/**
 * 基于关键词搜索并采集文章数据
 * 实现完整的三阶段采集策略：
 * 阶段1: 搜一搜获取文章列表
 * 阶段2: 并行采集文章详情
 * 阶段3: 并行采集互动数据
 */
export async function collectArticlesByKeyword(
  keyword: string,
  options: CollectionOptions = {
    articleCount: 20,
    batchSize: 10,
    batchDelay: 500,
    enableContentCollection: true,
    enableRankCollection: true,
  }
): Promise<CompleteArticleData[]> {
  const { key } = NEW_API_CONFIG;
  if (!key) {
    throw new Error('API密钥未配置');
  }

  console.log(`开始基于关键词"${keyword}"采集文章数据, 目标数量: ${options.articleCount}`);

  // 阶段1: 搜一搜获取文章列表
  console.log('阶段1: 搜一搜获取文章列表...');
  let searchArticles: SearchArticleItem[] = [];

  try {
    const response = await searchArticleList({ key, keyword });
    searchArticles = response.data;
    console.log(`🔍 搜一搜API返回 ${searchArticles.length} 篇文章`);
    console.log(`📊 用户设置采集数量: ${options.articleCount}`);
    console.log(`📝 前3篇文章标题:`, searchArticles.slice(0, 3).map(a => a.title));
  } catch (error) {
    console.error('搜一搜失败:', error);
    throw error;
  }

  // 截取到需要的数量
  const targetArticles = searchArticles.slice(0, options.articleCount);
  console.log(`选择前 ${targetArticles.length} 篇文章进行详细采集`);

  if (targetArticles.length === 0) {
    console.log('没有找到相关文章');
    return [];
  }

  // 阶段2: 并行采集详细信息和互动数据
  console.log('阶段2: 开始并行采集详细信息和互动数据...');
  const completeArticles: CompleteArticleData[] = targetArticles.map(article => ({
    basicInfo: {
      pub_time: article.pub_time,
      title: stripHtmlTags(article.title),
      sn: '', // 从详情中获取
      art_url: article.art_url,
      pic_url: article.pic_url,
    },
    collectionStatus: {
      basicCollected: true,
      detailCollected: false,
      rankCollected: false,
      errors: [],
    },
  }));

  // 分批处理
  for (let i = 0; i < completeArticles.length; i += options.batchSize) {
    const batch = completeArticles.slice(i, i + options.batchSize);
    console.log(`处理批次 ${Math.floor(i / options.batchSize) + 1}/${Math.ceil(completeArticles.length / options.batchSize)}`);

    // 为每批文章并行采集详细信息
    const batchPromises = batch.map(async (article, index) => {
      const articleIndex = i + index;
      try {
        // 先获取详情
        const detailResponse = options.enableContentCollection
          ? await getArticleInfo({ key, url: article.basicInfo.art_url })
          : null;

        // 处理详情数据
        if (detailResponse) {
          article.detailInfo = detailResponse.data;
          article.accountInfo = {
            name: detailResponse.data.name,
            user_name: detailResponse.data.user_name,
            signature: detailResponse.data.signature,
            headImgUrl: detailResponse.data.hd_head_img,
          };
          article.collectionStatus.detailCollected = true;
          // 更新基础信息中的sn
          article.basicInfo.sn = detailResponse.data.sn;
        }

        // 如果需要采集互动数据
        if (options.enableRankCollection && detailResponse?.data.comment_id) {
          try {
            const rankResponse = await getArticleRank({
              key,
              url: article.basicInfo.art_url,
              comment_id: detailResponse.data.comment_id,
            });

            if (rankResponse) {
              article.rankInfo = rankResponse.data;
              article.collectionStatus.rankCollected = true;
            }
          } catch (rankError) {
            article.collectionStatus.errors.push('互动数据采集失败');
            console.error('互动数据采集失败:', rankError);
          }
        } else if (options.enableRankCollection && !detailResponse?.data.comment_id) {
          article.collectionStatus.errors.push('无法获取comment_id，跳过互动数据采集');
        }

        console.log(`文章 ${articleIndex + 1}/${completeArticles.length} 采集完成: ${article.basicInfo.title}`);
      } catch (error) {
        const errorMsg = `文章采集失败: ${error instanceof Error ? error.message : '未知错误'}`;
        article.collectionStatus.errors.push(errorMsg);
        console.error(`文章 ${articleIndex + 1} 采集失败:`, error);
      }
    });

    // 等待当前批次完成
    await Promise.all(batchPromises);

    // 批次间延迟
    if (i + options.batchSize < completeArticles.length) {
      await delay(options.batchDelay);
    }
  }

  console.log('采集完成！');
  return completeArticles;
}

/**
 * 移除HTML标签的辅助函数
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * 筛选热门文章
 * 基于点赞数和互动率筛选
 */
export function filterPopularArticles(
  articles: CompleteArticleData[],
  topLikedCount: number = 5,
  topEngagedCount: number = 5
) {
  // 只有点赞数据的文章
  const articlesWithRank = articles.filter(article =>
    article.collectionStatus.rankCollected && article.rankInfo
  );

  // 按点赞数排序
  const topLiked = [...articlesWithRank]
    .sort((a, b) => (b.rankInfo?.like_num || 0) - (a.rankInfo?.like_num || 0))
    .slice(0, topLikedCount);

  // 按互动率排序 (点赞数 / 阅读数)
  const topEngaged = [...articlesWithRank]
    .map(article => ({
      ...article,
      engagementRate: article.rankInfo
        ? (article.rankInfo.like_num / Math.max(article.rankInfo.read_num, 1)) * 100
        : 0
    }))
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, topEngagedCount);

  return { topLiked, topEngaged };
}