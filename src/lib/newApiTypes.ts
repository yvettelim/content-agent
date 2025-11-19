// 新API配置 - wxrank.com
export const NEW_API_CONFIG = {
  baseUrl: 'http://data.wxrank.com/weixin',
  apiKey: process.env.NEXT_PUBLIC_NEW_WECHAT_API_KEY || '25ba56491d799f392c7d',
  key: process.env.NEXT_PUBLIC_NEW_WECHAT_API_KEY || '25ba56491d799f392c7d',
};

// 接口1: 获取公众号文章列表的参数
export interface GetPostListParams {
  key: string;
  wxid: string;
  cursor?: string; // 分页游标，第一页可以为空
}

// 接口1: 获取公众号文章列表的响应
export interface GetPostListResponse {
  code: number;
  data: {
    list: ArticleItem[];
    wxid: string;
    cursor: string;
  };
  msg: string;
}

// 文章基础信息
export interface ArticleItem {
  pub_time: string;
  title: string;
  sn: string; // 文章sn，用于获取详情
  art_url: string;
  pic_url: string;
}

// 接口2: 获取文章详细内容的参数
export interface GetArticleInfoParams {
  key: string;
  url: string; // 文章URL
}

// 接口2: 获取文章详细内容的响应
export interface GetArticleInfoResponse {
  code: number;
  data: {
    biz: string;
    mid: string;
    idx: string;
    sn: string;
    article_url: string;
    name: string; // 公众号名称
    user_name: string; // 公众号原始ID
    pub_time: string;
    signature: string; // 公众号简介
    hd_head_img: string; // 公众号头像
    msg_cdn_url: string; // 文章封面图
    service_type: string;
    copyright_stat: string;
    title: string; // 文章标题
    digest: string; // 文章摘要
    author: string; // 作者
    province_name: string; // 省份
    comment_id: string; // 评论ID，用于获取互动数据
    text: string; // 文章正文
    html: string; // 文章HTML内容
  };
  msg: string;
}

// 接口3: 获取文章互动数据的参数
export interface GetArticleRankParams {
  key: string;
  url: string; // 文章URL
  comment_id: string; // 评论ID
}

// 接口3: 获取文章互动数据的响应
export interface GetArticleRankResponse {
  code: number;
  data: {
    read_num: number; // 阅读数
    like_num: number; // 点赞数
    look_num: number; // 在看数
    share_num: number; // 分享数
    collect_num: number; // 收藏数
    reward_count: number; // 赞赏数
    comment_count: number; // 评论数
  };
  msg: string;
}

// 搜索公众号的参数
export interface SearchAccountParams {
  key: string;
  keyword: string;
}

// 搜索公众号的响应
export interface SearchAccountResponse {
  code: number;
  data: AccountItem[];
  msg: string;
}

// 公众号信息
export interface AccountItem {
  wx_id: string;
  wx_biz: string;
  wx_user: string;
  wx_name: string;
  signature: string;
  headImgUrl: string;
}

// 新接口: 搜一搜文章列表的参数
export interface GetSearchArticleListParams {
  key: string;
  keyword: string;
}

// 新接口: 搜一搜文章列表的响应
export interface GetSearchArticleListResponse {
  code: number;
  data: SearchArticleItem[];
  msg: string;
}

// 搜一搜文章项
export interface SearchArticleItem {
  wx_name: string;      // 公众号名称
  pub_time: string;     // 发布时间
  title: string;        // 文章标题（可能包含HTML高亮）
  desc: string;         // 文章描述（可能包含HTML高亮）
  art_url: string;      // 文章链接
  pic_url: string;      // 封面图片链接
}

// 采集配置选项
export interface CollectionOptions {
  articleCount: 10 | 20 | 50 | 100; // 采集文章数量
  batchSize: number; // 批次大小，默认10
  batchDelay: number; // 批次延迟(ms)，默认500
  enableContentCollection: boolean; // 是否采集文章内容
  enableRankCollection: boolean; // 是否采集互动数据
}

// 完整的文章数据结构
export interface CompleteArticleData {
  // 基础信息 (来自接口1)
  basicInfo: ArticleItem;
  // 详细内容 (来自接口2)
  detailInfo?: GetArticleInfoResponse['data'];
  // 互动数据 (来自接口3)
  rankInfo?: GetArticleRankResponse['data'];
  // 公众号信息 (来自接口2)
  accountInfo?: {
    name: string;
    user_name: string;
    signature: string;
    headImgUrl: string;
  };
  // 采集状态
  collectionStatus: {
    basicCollected: boolean;
    detailCollected: boolean;
    rankCollected: boolean;
    errors: string[];
  };
}