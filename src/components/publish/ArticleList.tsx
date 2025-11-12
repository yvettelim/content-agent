'use client';

import { formatDate } from '@/lib/utils';

interface ArticleListProps {
  selectedArticles: string[];
  onSelectArticle: (articleId: string) => void;
  onPreview: (article: any) => void;
}

export function ArticleList({ selectedArticles, onSelectArticle, onPreview }: ArticleListProps) {
  const articles = [
    {
      id: '1',
      title: 'AI工具使用指南',
      status: 'published',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      platforms: ['xiaohongshu', 'wechat'],
      content: '这是一篇关于AI工具使用的详细指南...'
    },
    {
      id: '2',
      title: '职场效率提升技巧',
      status: 'pending_review',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      platforms: [],
      content: '提升工作效率的实用技巧分享...'
    },
    {
      id: '3',
      title: '健康生活新方式',
      status: 'draft',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      platforms: [],
      content: '探索健康生活的新理念和方法...'
    },
    {
      id: '4',
      title: '2024趋势报告',
      status: 'rejected',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      platforms: [],
      content: '2024年各行业发展趋势分析...',
      rejectionReason: '内容违规'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '🟢 已发布';
      case 'pending_review':
        return '🟡 待审核';
      case 'draft':
        return '🔵 草稿';
      case 'rejected':
        return '🔴 审核失败';
      default:
        return '⚪ 未知';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'xiaohongshu':
        return '📕';
      case 'wechat':
        return '💬';
      default:
        return '📱';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectArticle('1');
                      onSelectArticle('2');
                      onSelectArticle('3');
                      onSelectArticle('4');
                    } else {
                      // 这里应该清空选择，简化处理
                    }
                  }}
                  className="text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                标题
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedArticles.includes(article.id)}
                    onChange={() => onSelectArticle(article.id)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{article.title}</span>
                    {article.status === 'rejected' && article.rejectionReason && (
                      <span className="text-xs text-red-600">({article.rejectionReason})</span>
                    )}
                  </div>
                  <div className="mt-1">
                    {article.platforms.map((platform, index) => (
                      <span key={platform} className="inline-flex items-center space-x-1 mr-3 text-sm text-gray-500">
                        <span>{getPlatformIcon(platform)}</span>
                        <span>{platform === 'xiaohongshu' ? '小红书' : '公众号'} ✓</span>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(article.status)}`}>
                    {getStatusText(article.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(article.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onPreview(article)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    编辑
                  </button>
                  <span className="text-gray-300">|</span>
                  <button className="text-primary-600 hover:text-primary-900">
                    发布
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-700">共 4 篇文章</span>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
            上一页
          </button>
          <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded">
            1
          </button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}