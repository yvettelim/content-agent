import { formatDate } from '@/lib/utils';

export function RecentAnalyses() {
  const analyses = [
    {
      id: '1',
      keyword: 'AI工具',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      articleCount: 45,
      accuracy: 95,
      engagement: 4.2
    },
    {
      id: '2',
      keyword: '职场效率',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      articleCount: 38,
      accuracy: 92,
      engagement: 5.8
    },
    {
      id: '3',
      keyword: '健康生活',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      articleCount: 52,
      accuracy: 89,
      engagement: 3.7
    }
  ];

  return (
    <div className="apple-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">最近分析记录</h2>
        <div className="w-10 h-1 bg-purple-600 rounded-full"></div>
      </div>
      <div className="space-y-4">
        {analyses.map((analysis) => (
          <div key={analysis.id} className="group p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{analysis.keyword}</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    已完成
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">文章数量</p>
                    <p className="text-sm font-semibold text-gray-900">{analysis.articleCount} 篇</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">准确率</p>
                    <p className="text-sm font-semibold text-gray-900">{analysis.accuracy}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">平均互动率</p>
                    <p className="text-sm font-semibold text-gray-900">{analysis.engagement}%</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{formatDate(analysis.createdAt)}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <button className="apple-button-secondary text-xs">
                  查看报告
                </button>
                <button className="apple-button-primary text-xs">
                  重新分析
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          查看全部分析记录 →
        </button>
      </div>
    </div>
  );
}