'use client';

import { useState } from 'react';

export function ImageManager() {
  const [images, setImages] = useState([
    {
      id: '1',
      url: '/api/placeholder/300/200',
      alt: 'AI工具示意图',
      source: 'unsplash'
    },
    {
      id: '2',
      url: '/api/placeholder/300/200',
      alt: '数据分析图表',
      source: 'unsplash'
    },
    {
      id: '3',
      url: '/api/placeholder/300/200',
      alt: '任务调度界面',
      source: 'unsplash'
    }
  ]);

  const handleRegenerateImages = () => {
    // 模拟重新生成图片
    setImages(images.map(img => ({
      ...img,
      url: `/api/placeholder/${300 + Math.random() * 100}/${200 + Math.random() * 100}`
    })));
  };

  const handleSearchImages = () => {
    // 模拟搜索更多图片
    console.log('搜索更多图片...');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">图片管理</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">当前已插入 {images.length} 张图片</span>
          <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded hover:bg-primary-200">
            + 添加图片
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                <button className="p-1 bg-white rounded text-xs hover:bg-gray-100">
                  编辑
                </button>
                <button className="p-1 bg-white rounded text-xs hover:bg-gray-100">
                  替换
                </button>
                <button className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">
                  删除
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1 truncate">{image.alt}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-4 pt-4 border-t">
          <button
            onClick={handleRegenerateImages}
            className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center space-x-1"
          >
            <span>🔄</span>
            <span>重新生成</span>
          </button>
          <button className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center space-x-1">
            <span>⬆️</span>
            <span>上传本地</span>
          </button>
          <button
            onClick={handleSearchImages}
            className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center space-x-1"
          >
            <span>🔍</span>
            <span>搜索更多</span>
          </button>
        </div>
      </div>
    </div>
  );
}