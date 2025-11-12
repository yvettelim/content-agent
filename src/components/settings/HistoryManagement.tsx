'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';

export function HistoryManagement() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const analysisHistory = [
    {
      id: '1',
      keyword: 'AI工具',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      articleCount: 45,
      size: '12.5 MB'
    },
    {
      id: '2',
      keyword: '职场效率',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      articleCount: 38,
      size: '10.2 MB'
    },
    {
      id: '3',
      keyword: '健康生活',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      articleCount: 52,
      size: '14.8 MB'
    }
  ];

  const contentHistory = [
    {
      id: '1',
      title: 'AI工具使用指南',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'published',
      platforms: ['xiaohongshu', 'wechat'],
      size: '2.3 MB'
    },
    {
      id: '2',
      title: '职场效率提升技巧',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft',
      platforms: [],
      size: '1.8 MB'
    },
    {
      id: '3',
      title: '健康生活新方式',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft',
      platforms: [],
      size: '3.1 MB'
    }
  ];

  const tabs = [
    { id: 'analysis', label: '分析记录', count: analysisHistory.length },
    { id: 'content', label: '内容记录', count: contentHistory.length }
  ];

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      alert('请先选择要删除的记录');
      return;
    }

    if (confirm(`确定要删除选中的 ${selectedItems.length} 条记录吗？此操作不可恢复。`)) {
      console.log('删除记录:', selectedItems);
      setSelectedItems([]);
      alert('记录已删除');
    }
  };

  const handleExportData = () => {
    console.log('导出数据...');
    alert('数据导出成功！');
  };

  const handleClearAll = (type: string) => {
    if (confirm(`确定要清空所有${type === 'analysis' ? '分析' : '内容'}记录吗？此操作不可恢复。`)) {
      console.log(`清空所有${type === 'analysis' ? '分析' : '内容'}记录`);
      alert(`所有${type === 'analysis' ? '分析' : '内容'}记录已清空`);
    }
  };

  const currentHistory = activeTab === 'analysis' ? analysisHistory : contentHistory;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">历史记录管理</h2>
        <p className="text-sm text-gray-600 mb-6">查看和管理历史分析记录和内容记录</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedItems([]);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {selectedItems.length > 0 && (
            <>
              <span className="text-sm text-gray-600">
                已选择 {selectedItems.length} 条记录
              </span>
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                删除选中
              </button>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExportData}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            导出数据
          </button>
          <button
            onClick={() => handleClearAll(activeTab)}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            清空全部
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(currentHistory.map(item => item.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  className="text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {activeTab === 'analysis' ? '关键词' : '标题'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {activeTab === 'analysis' ? '文章数量' : '发布平台'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                大小
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
            {currentHistory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {activeTab === 'analysis' ? item.keyword : item.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'completed' || item.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'draft'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status === 'completed' ? '已完成' :
                     item.status === 'published' ? '已发布' :
                     item.status === 'draft' ? '草稿' : '未知'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activeTab === 'analysis'
                    ? `${(item as any).articleCount}篇`
                    : (item as any).platforms.length > 0
                    ? (item as any).platforms.map((p: string) =>
                        p === 'xiaohongshu' ? '小红书' : '公众号'
                      ).join(', ')
                    : '未发布'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(item as any).size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-primary-600 hover:text-primary-900">
                    查看
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}