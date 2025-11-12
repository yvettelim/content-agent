'use client';

import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      title: '开始新的选题分析',
      description: '分析热门话题和趋势',
      icon: '📊',
      href: '/analysis',
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100 text-blue-600'
    },
    {
      title: '创建新文章',
      description: '使用AI快速生成内容',
      icon: '✍️',
      href: '/create',
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100 text-green-600'
    },
    {
      title: '快速发布',
      description: '一键发布到多个平台',
      icon: '📱',
      href: '/publish',
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100 text-purple-600'
    },
    {
      title: '查看报告',
      description: '数据分析与洞察',
      icon: '📈',
      href: '/analysis',
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="apple-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">快速操作</h2>
        <div className="w-10 h-1 bg-blue-600 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group block p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-2xl ${action.iconBg} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200`}>
                {action.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{action.description}</p>
              </div>
              <div className={`h-0.5 w-0 bg-gradient-to-r ${action.gradient} group-hover:w-full transition-all duration-300 rounded-full`}></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}