'use client';

import { useState, useEffect } from 'react';
import { TopicAnalysis } from '@/types';
import { fetchAnalysisHistory, deleteAnalysis as deleteAnalysisApi } from '@/lib/apiService';
import { formatDate } from '@/lib/utils';

export function AnalysisHistory() {
  const [histories, setHistories] = useState<TopicAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [total, setTotal] = useState(0);

  const pageSize = 10;

  const fetchHistory = async (page: number = 1, keyword: string = '') => {
    try {
      setLoading(true);
      const result = await fetchAnalysisHistory(page, pageSize, keyword);
      setHistories(result.analyses);
      setTotalPages(result.totalPage);
      setTotal(result.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('获取分析历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage, searchKeyword);
  }, [currentPage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchHistory(1, searchKeyword);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchKeyword]);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条分析记录吗？')) {
      return;
    }

    try {
      const success = await deleteAnalysisApi(id);
      if (success) {
        setHistories(prev => prev.filter(item => item.id !== id));
        if (histories.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchHistory(currentPage, searchKeyword);
        }
      }
    } catch (error) {
      console.error('删除分析记录失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory(1, searchKeyword);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">历史分析</h2>
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索历史记录..."
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            搜索
          </button>
        </form>
      </div>

      {histories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>暂无分析记录</p>
          <p className="text-sm mt-2">开始您的第一次选题分析吧！</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">关键词</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">文章数量</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">分析时间</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">状态</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {histories.map((history) => (
                  <tr key={history.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <span className="font-medium text-gray-900">{history.keyword}</span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600">
                      {history.totalArticles || 0} 篇
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600">
                      {formatDate(history.createdAt)}
                    </td>
                    <td className="py-2 px-3">
                      <span className="flex items-center space-x-1">
                        <span>{getStatusIcon(history.status)}</span>
                        <span className="text-sm text-gray-600">
                          {history.status === 'completed' ? '已完成' :
                           history.status === 'failed' ? '失败' :
                           history.status === 'processing' ? '处理中' : '等待中'}
                        </span>
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex space-x-2">
                        {history.status === 'completed' && (
                          <button
                            onClick={() => window.open(`/analysis/report/${history.id}`, '_blank')}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            查看报告
                          </button>
                        )}
                        <button
                          onClick={() => {
                            // 填充搜索表单并重新分析
                            const keyword = history.keyword;
                            const articleCount = history.articleCount;
                            const timeRange = history.timeRange;

                            // 查找并填充搜索表单
                            const keywordInput = document.querySelector('input[placeholder*="关键词"]') as HTMLInputElement;
                            const articleCountSelect = document.querySelector('select') as HTMLSelectElement;
                            const timeRangeSelect = document.querySelector('select[value="7"], select[value="30"], select[value="90"]') as HTMLSelectElement;

                            if (keywordInput) {
                              keywordInput.value = keyword;
                              keywordInput.focus();
                            }

                            if (articleCountSelect) {
                              articleCountSelect.value = articleCount.toString();
                            }

                            if (timeRangeSelect) {
                              timeRangeSelect.value = timeRange.toString();
                            }

                            // 滚动到搜索表单位置
                            const searchConfig = document.querySelector('[class*="bg-white rounded-lg shadow"]');
                            if (searchConfig) {
                              searchConfig.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                          className="text-sm text-gray-600 hover:underline"
                        >
                          重新分析
                        </button>
                        <button
                          onClick={() => handleDelete(history.id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-600">
                共 {total} 条记录，第 {currentPage} / {totalPages} 页
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>

                {/* 页码按钮 */}
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
                      onClick={() => handlePageChange(pageNum)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}