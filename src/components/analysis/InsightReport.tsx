'use client';

export function InsightReport() {
  const topLikedArticles = [
    { id: '1', title: 'AI工具在职场中的5大应用场景', likeCount: 1250 },
    { id: '2', title: '如何用ChatGPT提升工作效率', likeCount: 980 },
    { id: '3', title: '2024年最值得关注的AI趋势', likeCount: 850 },
    { id: '4', title: '普通人如何拥抱AI时代', likeCount: 720 },
    { id: '5', title: 'AI写作工具全面评测', likeCount: 680 }
  ];

  const topEngagementArticles = [
    { id: '1', title: 'AI使用心得分享', engagementRate: 12.5 },
    { id: '2', title: '职场人必学的AI技能', engagementRate: 10.2 },
    { id: '3', title: 'AI改变生活的真实案例', engagementRate: 9.8 },
    { id: '4', title: '如何避免被AI替代', engagementRate: 8.5 },
    { id: '5', title: 'AI工具使用避坑指南', engagementRate: 7.9 }
  ];

  const wordCloud = [
    { word: 'AI工具', count: 45 },
    { word: '工作效率', count: 38 },
    { word: 'ChatGPT', count: 32 },
    { word: '职场', count: 28 },
    { word: '自动化', count: 25 },
    { word: '创新', count: 22 },
    { word: '未来', count: 20 },
    { word: '技能', count: 18 }
  ];

  const insights = [
    '用户对AI实用工具的关注度最高，尤其是能直接提升工作效率的工具',
    '职场相关话题具有很高的互动率，说明用户渴望学习AI应用技能',
    'ChatGPT和相关对话式AI是最热门的话题，用户好奇心强',
    '具体的案例和教程类内容更容易获得用户点赞和分享',
    '对AI未来发展趋势的讨论具有很好的传播潜力'
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">洞察报告</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📈</span>
            <span className="font-medium text-gray-900">数据概览</span>
          </div>
          <span className="text-gray-600">共分析 50 篇文章</span>
        </div>
        <p className="text-gray-600 mt-2">平均互动率: 4.2%</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">🔥</span> 点赞量TOP5
          </h3>
          <div className="space-y-2">
            {topLikedArticles.map((article, index) => (
              <div key={article.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm text-gray-900">{article.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-red-600">{article.likeCount}赞</span>
                  <button className="text-xs text-primary-600 hover:underline">查看</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">💬</span> 互动率TOP5
          </h3>
          <div className="space-y-2">
            {topEngagementArticles.map((article, index) => (
              <div key={article.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm text-gray-900">{article.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600">{article.engagementRate}%</span>
                  <button className="text-xs text-primary-600 hover:underline">查看</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">☁️</span> 高频词云
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-wrap gap-2">
            {wordCloud.map((word, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                style={{
                  fontSize: `${Math.max(0.75, word.count / 10)}rem`,
                  opacity: Math.max(0.6, word.count / 45)
                }}
              >
                {word.word} ({word.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">💡</span> 选题洞察
        </h3>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-primary-600 mt-1">•</span>
              <p className="text-sm text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center space-x-4 mt-6">
        <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          保存报告
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          基于此创作
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
          分享报告
        </button>
      </div>
    </div>
  );
}