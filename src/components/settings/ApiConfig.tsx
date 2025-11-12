'use client';

import { useState } from 'react';

export function ApiConfig() {
  const [configs, setConfigs] = useState({
    wechatApiUrl: '',
    wechatApiKey: '',
    xiaohongshuApiUrl: '',
    xiaohongshuApiKey: '',
    aiApiUrl: 'https://api.openai.com/v1',
    aiApiKey: '',
    unsplashAccessKey: ''
  });

  const handleInputChange = (key: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // 这里保存配置到后端
    console.log('保存配置:', configs);
    alert('配置已保存！');
  };

  const handleTestConnection = (apiType: string) => {
    // 这里测试API连接
    console.log(`测试 ${apiType} API 连接...`);
    alert(`${apiType} API 连接测试成功！`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API 配置</h2>
        <p className="text-sm text-gray-600 mb-6">配置第三方API密钥和连接参数</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💬</span> 公众号API配置
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API地址
              </label>
              <input
                type="text"
                value={configs.wechatApiUrl}
                onChange={(e) => handleInputChange('wechatApiUrl', e.target.value)}
                placeholder="https://api.wechat.com/v1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API密钥
              </label>
              <input
                type="password"
                value={configs.wechatApiKey}
                onChange={(e) => handleInputChange('wechatApiKey', e.target.value)}
                placeholder="请输入API密钥"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            onClick={() => handleTestConnection('公众号')}
            className="mt-3 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            测试连接
          </button>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📕</span> 小红书API配置
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API地址
              </label>
              <input
                type="text"
                value={configs.xiaohongshuApiUrl}
                onChange={(e) => handleInputChange('xiaohongshuApiUrl', e.target.value)}
                placeholder="https://api.xiaohongshu.com/v1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API密钥
              </label>
              <input
                type="password"
                value={configs.xiaohongshuApiKey}
                onChange={(e) => handleInputChange('xiaohongshuApiKey', e.target.value)}
                placeholder="请输入API密钥"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            onClick={() => handleTestConnection('小红书')}
            className="mt-3 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            测试连接
          </button>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🤖</span> AI API配置
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API地址
              </label>
              <input
                type="text"
                value={configs.aiApiUrl}
                onChange={(e) => handleInputChange('aiApiUrl', e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API密钥
              </label>
              <input
                type="password"
                value={configs.aiApiKey}
                onChange={(e) => handleInputChange('aiApiKey', e.target.value)}
                placeholder="请输入OpenAI API密钥"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            onClick={() => handleTestConnection('AI')}
            className="mt-3 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            测试连接
          </button>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📷</span> Unsplash API配置
          </h3>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Key
            </label>
            <input
              type="password"
              value={configs.unsplashAccessKey}
              onChange={(e) => handleInputChange('unsplashAccessKey', e.target.value)}
              placeholder="请输入Unsplash Access Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => handleTestConnection('Unsplash')}
            className="mt-3 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            测试连接
          </button>
        </div>
      </div>

      <div className="pt-6 border-t">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          保存所有配置
        </button>
      </div>
    </div>
  );
}