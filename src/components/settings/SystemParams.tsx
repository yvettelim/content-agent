'use client';

import { useState } from 'react';

export function SystemParams() {
  const [params, setParams] = useState({
    defaultArticleCount: '50',
    defaultTimeRange: '30',
    maxRetryAttempts: '3',
    aiModel: 'gpt-3.5-turbo',
    aiTemperature: '0.7',
    aiMaxTokens: '2000',
    imageQuality: 'medium',
    cacheExpiry: '24',
    logLevel: 'info'
  });

  const handleInputChange = (key: string, value: string) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('保存系统参数:', params);
    alert('系统参数已保存！');
  };

  const handleReset = () => {
    if (confirm('确定要重置为默认参数吗？')) {
      setParams({
        defaultArticleCount: '50',
        defaultTimeRange: '30',
        maxRetryAttempts: '3',
        aiModel: 'gpt-3.5-turbo',
        aiTemperature: '0.7',
        aiMaxTokens: '2000',
        imageQuality: 'medium',
        cacheExpiry: '24',
        logLevel: 'info'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">系统参数</h2>
        <p className="text-sm text-gray-600 mb-6">配置系统运行参数和默认值</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">分析默认参数</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                默认文章数量
              </label>
              <select
                value={params.defaultArticleCount}
                onChange={(e) => handleInputChange('defaultArticleCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="20">20篇</option>
                <option value="50">50篇</option>
                <option value="100">100篇</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                默认时间范围（天）
              </label>
              <select
                value={params.defaultTimeRange}
                onChange={(e) => handleInputChange('defaultTimeRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7">7天</option>
                <option value="30">30天</option>
                <option value="90">90天</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大重试次数
              </label>
              <input
                type="number"
                value={params.maxRetryAttempts}
                onChange={(e) => handleInputChange('maxRetryAttempts', e.target.value)}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">AI模型参数</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI模型
              </label>
              <select
                value={params.aiModel}
                onChange={(e) => handleInputChange('aiModel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                温度参数 (0-1)
              </label>
              <input
                type="number"
                value={params.aiTemperature}
                onChange={(e) => handleInputChange('aiTemperature', e.target.value)}
                min="0"
                max="1"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大Token数
              </label>
              <input
                type="number"
                value={params.aiMaxTokens}
                onChange={(e) => handleInputChange('aiMaxTokens', e.target.value)}
                min="100"
                max="4000"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">图片参数</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图片质量
              </label>
              <select
                value={params.imageQuality}
                onChange={(e) => handleInputChange('imageQuality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">低质量</option>
                <option value="medium">中等质量</option>
                <option value="high">高质量</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">系统参数</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                缓存过期时间（小时）
              </label>
              <input
                type="number"
                value={params.cacheExpiry}
                onChange={(e) => handleInputChange('cacheExpiry', e.target.value)}
                min="1"
                max="168"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日志级别
              </label>
              <select
                value={params.logLevel}
                onChange={(e) => handleInputChange('logLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t flex space-x-4">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          保存参数
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          重置为默认值
        </button>
      </div>
    </div>
  );
}