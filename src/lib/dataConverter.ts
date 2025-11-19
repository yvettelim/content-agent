import { CompleteArticleData } from './newApiTypes';
import { WechatArticle } from '@/types';

/**
 * 将新API的数据格式转换为现有系统兼容的格式
 */
export function convertToWechatArticle(newArticleData: CompleteArticleData): WechatArticle {
  const { basicInfo, detailInfo, rankInfo, accountInfo } = newArticleData;

  // 基础字段转换
  const article: WechatArticle = {
    // WechatArticle 必需字段
    title: basicInfo.title || '',
    content: detailInfo?.text || '',
    url: basicInfo.art_url || '',
    wx_name: accountInfo?.name || '',
    wx_id: accountInfo?.user_name || '',
    publish_time: detailInfo ? convertPublishTime(detailInfo.pub_time) : convertPublishTime(basicInfo.pub_time),
    publish_time_str: detailInfo?.pub_time || basicInfo.pub_time || '',
    read: rankInfo?.read_num || 0,
    praise: rankInfo?.like_num || 0,
    looking: rankInfo?.look_num || 0,

    // 缺少的必需字段 - 提供默认值
    avatar: basicInfo.pic_url || '',
    classify: '',
    ghid: '',
    ip_wording: '',
    is_original: detailInfo?.copyright_stat === '1' ? 1 : 0,
    short_link: '',
    update_time: 0,
    update_time_str: '',
  };

  // 字段已经在初始化时设置完成

  return article;
}

/**
 * 转换发布时间为时间戳
 */
function convertPublishTime(pubTimeStr: string): number {
  try {
    // 格式: "2025-02-16 20:10:57"
    return Math.floor(new Date(pubTimeStr).getTime() / 1000);
  } catch (error) {
    console.error('转换发布时间失败:', pubTimeStr, error);
    return Date.now() / 1000;
  }
}

/**
 * 批量转换文章数据
 */
export function batchConvertArticles(newArticlesData: CompleteArticleData[]): WechatArticle[] {
  return newArticlesData.map(data => convertToWechatArticle(data));
}

/**
 * 提取公众号信息用于分析
 */
export function extractAccountInfo(newArticlesData: CompleteArticleData[]) {
  // 从第一篇有详细信息的文章中提取公众号信息
  const firstDetailedArticle = newArticlesData.find(article => article.detailInfo);

  if (!firstDetailedArticle) {
    return null;
  }

  return {
    name: firstDetailedArticle.accountInfo?.name || '',
    wxid: firstDetailedArticle.detailInfo?.user_name || '',
    biz: firstDetailedArticle.detailInfo?.biz || '',
    signature: firstDetailedArticle.accountInfo?.signature || '',
    avatar: firstDetailedArticle.accountInfo?.headImgUrl || '',
  };
}

/**
 * 计算采集统计信息
 */
export function calculateCollectionStats(articles: CompleteArticleData[]) {
  const total = articles.length;
  const basicCollected = articles.filter(a => a.collectionStatus.basicCollected).length;
  const detailCollected = articles.filter(a => a.collectionStatus.detailCollected).length;
  const rankCollected = articles.filter(a => a.collectionStatus.rankCollected).length;
  const withErrors = articles.filter(a => a.collectionStatus.errors.length > 0).length;

  return {
    total,
    basicCollected,
    detailCollected,
    rankCollected,
    withErrors,
    successRate: ((total - withErrors) / total * 100).toFixed(1) + '%',
    errors: articles.flatMap(a => a.collectionStatus.errors),
  };
}