'use client';

import { WechatArticle } from '@/types';
import { formatDate } from '@/lib/utils';

interface ArticleModalProps {
  article: WechatArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  if (!isOpen || !article) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatReadCount = (count: number) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    return count.toLocaleString();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {article.avatar && (
              <img
                src={article.avatar}
                alt={article.wx_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{article.wx_name}</h3>
              <p className="text-sm text-gray-500">
                {article.publish_time_str || formatDate(new Date(article.publish_time * 1000).toISOString())}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 标题 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h1>

          {/* 统计信息 */}
          <div className="flex items-center space-x-6 mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{formatReadCount(article.read)}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{article.praise.toLocaleString()}</span>
            </div>
            {article.looking && article.looking > 0 && (
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{article.looking.toLocaleString()}</span>
              </div>
            )}
            {article.is_original === 1 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                原创
              </span>
            )}
          </div>

          {/* 文章内容 */}
          <div className="prose prose-lg max-w-none">
            <div
              className="text-gray-800 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: article.content || '暂无内容' }}
            />
          </div>

          {/* 原文链接 */}
          {article.url && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>查看原文</span>
              </a>
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            关闭
          </button>
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              打开原文
            </a>
          )}
        </div>
      </div>
    </div>
  );
}