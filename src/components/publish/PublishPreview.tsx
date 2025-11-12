'use client';

import { useState } from 'react';

interface PublishPreviewProps {
  article: {
    id: string;
    title: string;
    content: string;
    status: string;
  };
}

export function PublishPreview({ article }: PublishPreviewProps) {
  const [selectedPlatform, setSelectedPlatform] = useState('xiaohongshu');

  const platforms = [
    { id: 'xiaohongshu', name: '小红书', icon: '📕', isPublished: true },
    { id: 'wechat', name: '公众号', icon: '💬', isPublished: true }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">发布预览</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-2">文章预览</h3>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-2">{article.title}</h4>
            <div className="text-sm text-gray-600 max-h-40 overflow-y-auto">
              {article.content.substring(0, 150)}...
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 mb-2">平台适配</h3>
          <div className="flex space-x-2">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`flex-1 p-3 border rounded-lg text-center transition-colors ${
                  selectedPlatform === platform.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">{platform.icon}</div>
                <div className="text-sm font-medium">{platform.name}</div>
                {platform.isPublished && (
                  <div className="text-xs text-green-600">✓ 已发布</div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 mb-2">
            {platforms.find(p => p.id === selectedPlatform)?.name} 预览
          </h3>
          <div className="border border-gray-200 rounded-lg p-4">
            {selectedPlatform === 'xiaohongshu' ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">用户名</div>
                    <div className="text-xs text-gray-500">2小时前</div>
                  </div>
                </div>
                <div className="text-sm">{article.title}</div>
                <div className="grid grid-cols-2 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>❤️ 128</span>
                  <span>💬 32</span>
                  <span>⭐ 16</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center border-b pb-2">
                  <h3 className="text-lg font-bold">{article.title}</h3>
                  <div className="text-xs text-gray-500">内容工厂 · 今天</div>
                </div>
                <div className="text-sm leading-relaxed">
                  {article.content.substring(0, 200)}...
                </div>
                <div className="text-center text-xs text-gray-500 border-t pt-2">
                  <div>阅读原文</div>
                  <div className="flex items-center justify-center space-x-4 mt-2">
                    <span>👍 256</span>
                    <span>💬 48</span>
                    <span>⭐ 12</span>
                    <span>↗️ 分享</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            确认发布到 {platforms.find(p => p.id === selectedPlatform)?.name}
          </button>
        </div>
      </div>
    </div>
  );
}