export function StatsCards() {
  const stats = [
    {
      label: '今日分析',
      value: '3',
      unit: '次',
      change: '+2',
      changeType: 'positive',
      icon: '📊',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      label: '本周发布',
      value: '12',
      unit: '篇',
      change: '+8',
      changeType: 'positive',
      icon: '📝',
      gradient: 'from-green-500 to-green-600'
    },
    {
      label: '总阅读量',
      value: '1.2',
      unit: '万',
      change: '+0.3万',
      changeType: 'positive',
      icon: '👁️',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      label: '平均互动率',
      value: '5.8',
      unit: '%',
      change: '+1.2%',
      changeType: 'positive',
      icon: '💬',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="apple-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">数据统计</h2>
        <div className="w-10 h-1 bg-green-600 rounded-full"></div>
      </div>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="group p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                    <span className="text-sm text-gray-500">{stat.unit}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600">
                  <span className="text-sm font-semibold">{stat.change}</span>
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">vs 上周</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}