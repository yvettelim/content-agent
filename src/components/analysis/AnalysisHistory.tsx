'use client';

import { formatDate } from '@/lib/utils';

export function AnalysisHistory() {
  const histories = [
    {
      id: '1',
      keyword: 'AI工具',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: '2',
      keyword: '职场效率',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: '3',
      keyword: '健康生活',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: '4',
      keyword: '投资理财',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'failed'
    }
  ];

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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">历史分析</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="搜索历史记录..."
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded hover:bg-primary-200">
            搜索
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">关键词</th>
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
                  {formatDate(history.createdAt)}
                </td>
                <td className="py-2 px-3">
                  <span className="flex items-center space-x-1">
                    <span>{getStatusIcon(history.status)}</span>
                    <span className="text-sm text-gray-600">
                      {history.status === 'completed' ? '已完成' : '失败'}
                    </span>
                  </span>
                </td>
                <td className="py-2 px-3">
                  <div className="flex space-x-2">
                    <button className="text-sm text-primary-600 hover:underline">
                      查看报告
                    </button>
                    <button className="text-sm text-gray-600 hover:underline">
                      重新分析
                    </button>
                    <button className="text-sm text-red-600 hover:underline">
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">共 4 条记录</span>
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