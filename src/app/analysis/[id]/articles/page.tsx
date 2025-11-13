'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WechatArticle } from '@/types';
import { getAnalysisResult } from '@/lib/analysisService';
import { formatDate } from '@/lib/utils';
import { ArticleModal } from '@/components/analysis/ArticleModal';

export default function ArticlesPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;

  const [articles, setArticles] = useState<WechatArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<WechatArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');

  const pageSize = 20;

  const fetchArticles = async (page: number = 1) => {
    try {
      setLoading(true);
      const result = await getAnalysisResult(analysisId, page, pageSize);

      if (result.analysis && result.articles) {
        setArticles(result.articles);
        setTotalPages(Math.ceil(result.total / pageSize));
      } else {
        setError('未找到相关文章数据');
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
      setError('获取文章列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (analysisId) {
      fetchArticles(currentPage);
    }
  }, [analysisId, currentPage]);

  const handleArticleClick = (article: WechatArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const formatReadCount = (count: number | undefined) => {
    if (!count || count === 0) return '0';
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    return count.toLocaleString();
  };

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => {
      const praiseDiff = (b.praise || 0) - (a.praise || 0);
      if (praiseDiff !== 0) return praiseDiff;
      const lookingDiff = (b.looking || 0) - (a.looking || 0);
      if (lookingDiff !== 0) return lookingDiff;
      const readDiff = (b.read || 0) - (a.read || 0);
      if (readDiff !== 0) return readDiff;
      return (b.publish_time || 0) - (a.publish_time || 0);
    });
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (!searchKeyword) {
      return sortedArticles;
    }

    const keyword = searchKeyword.toLowerCase();
    return sortedArticles.filter(article =>
      article.title.toLowerCase().includes(keyword) ||
      article.wx_name?.toLowerCase().includes(keyword)
    );
  }, [sortedArticles, searchKeyword]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载文章列表中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">文章列表</h1>
              <span className="text-sm text-gray-500">
                共 {articles.length} 篇文章
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索文章标题或公众号名称..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-gray-600">
              找到 {filteredArticles.length} 篇文章
            </div>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-lg mb-2">📭</div>
            <p className="text-gray-600">
              {searchKeyword ? '未找到匹配的文章' : '暂无文章数据'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article, index) => (
              <div
                key={`${article.title}-${index}`}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleArticleClick(article)}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {article.avatar && (
                      <img
                        src={article.avatar}
                        alt={article.wx_name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                          {article.title}
                        </h3>
                        {article.is_original === 1 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2 flex-shrink-0">
                            原创
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium">{article.wx_name}</span>
                        <span>·</span>
                        <span>{article.publish_time_str || formatDate(new Date(article.publish_time * 1000).toISOString())}</span>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{formatReadCount(article.read)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>{formatReadCount(article.praise)}</span>
                        </div>
                        {article.looking && article.looking > 0 && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>{formatReadCount(article.looking)}</span>
                          </div>
                        )}
                        {article.classify && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {article.classify}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {!searchKeyword && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* 文章详情弹窗 */}
      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
