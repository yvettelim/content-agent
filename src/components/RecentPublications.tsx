import { formatDate } from '@/lib/utils';

export function RecentPublications() {
  const publications = [
    {
      id: '1',
      title: 'AI提升工作效率的5个技巧',
      platforms: ['xiaohongshu'],
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      views: 1250,
      likes: 89,
      shares: 12
    },
    {
      id: '2',
      title: '如何平衡工作与生活',
      platforms: ['wechat'],
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      views: 892,
      likes: 67,
      shares: 8
    },
    {
      id: '3',
      title: '2024年健康趋势报告',
      status: 'draft',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'xiaohongshu':
        return { icon: '📕', name: '小红书', color: 'text-red-500' };
      case 'wechat':
        return { icon: '💬', name: '公众号', color: 'text-green-500' };
      default:
        return { icon: '📱', name: '未知平台', color: 'text-gray-500' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="apple-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">最近发布</h2>
        <div className="w-10 h-1 bg-orange-600 rounded-full"></div>
      </div>
      <div className="space-y-4">
        {publications.map((pub) => (
          <div key={pub.id} className="group p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center space-x-2">
                    {pub.platforms ? (
                      pub.platforms.map((platform) => {
                        const info = getPlatformInfo(platform);
                        return (
                          <span key={platform} className={`text-xl ${info.color}`}>
                            {info.icon}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-lg">📝</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{pub.title}</h3>
                  {pub.status && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(pub.status)}`}>
                      {pub.status === 'draft' ? '草稿' : '已发布'}
                    </span>
                  )}
                </div>

                {pub.platforms && (
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">阅读量</p>
                      <p className="text-sm font-semibold text-gray-900">{(pub as any).views || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">点赞数</p>
                      <p className="text-sm font-semibold text-gray-900">{(pub as any).likes || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">分享数</p>
                      <p className="text-sm font-semibold text-gray-900">{(pub as any).shares || 0}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>
                    {pub.platforms ?
                      pub.platforms.map(p => getPlatformInfo(p).name).join(' · ') :
                      '未发布'
                    }
                  </span>
                  <span>·</span>
                  <span>{formatDate(pub.publishedAt || pub.createdAt)}</span>
                </div>
              </div>
              <button className="apple-button-secondary text-xs">
                查看详情
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          管理发布内容 →
        </button>
      </div>
    </div>
  );
}