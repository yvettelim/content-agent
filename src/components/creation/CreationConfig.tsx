'use client';

import { useState } from 'react';

interface CreationConfigProps {
  onStartCreation: () => void;
  isGenerating: boolean;
}

export function CreationConfig({ onStartCreation, isGenerating }: CreationConfigProps) {
  const [sourceType, setSourceType] = useState('report');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [articleLength, setArticleLength] = useState('800-1200');
  const [writingStyle, setWritingStyle] = useState('professional');
  const [imageCount, setImageCount] = useState('3');

  const availableTopics = [
    { id: '1', title: '选题1：AI工具在职场中的5大应用场景' },
    { id: '2', title: '选题2：如何用ChatGPT提升工作效率' },
    { id: '3', title: '选题3：2024年最值得关注的AI趋势' },
    { id: '4', title: '选题4：普通人如何拥抱AI时代' },
    { id: '5', title: '选题5：AI写作工具全面评测' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">✍️ 内容创作</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-3">选题来源：</h3>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                value="report"
                checked={sourceType === 'report'}
                onChange={(e) => setSourceType(e.target.value)}
                className="mr-2 text-primary-600 focus:ring-primary-500"
              />
              <span>从洞察报告选择</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="custom"
                checked={sourceType === 'custom'}
                onChange={(e) => setSourceType(e.target.value)}
                className="mr-2 text-primary-600 focus:ring-primary-500"
              />
              <span>自定义输入</span>
            </label>
          </div>
        </div>

        {sourceType === 'report' ? (
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3">可用选题：</h3>
            <div className="border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
              <div className="space-y-2">
                {availableTopics.map((topic) => (
                  <label key={topic.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedTopic === topic.id}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTopic(topic.id);
                        } else {
                          setSelectedTopic('');
                        }
                      }}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{topic.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-base font-medium text-gray-900 mb-3">
              自定义选题：
            </label>
            <textarea
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="请输入您的自定义选题..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>
        )}

        <div>
          <h3 className="text-base font-medium text-gray-900 mb-3">创作参数：</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章长度：
              </label>
              <select
                value={articleLength}
                onChange={(e) => setArticleLength(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="500-800">500-800字</option>
                <option value="800-1200">800-1200字</option>
                <option value="1200-2000">1200-2000字</option>
                <option value="2000+">2000字以上</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                写作风格：
              </label>
              <select
                value={writingStyle}
                onChange={(e) => setWritingStyle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="professional">专业严谨</option>
                <option value="casual">轻松活泼</option>
                <option value="storytelling">故事叙述</option>
                <option value="tutorial">教程指南</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图片数量：
              </label>
              <select
                value={imageCount}
                onChange={(e) => setImageCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="0">不插入图片</option>
                <option value="1">1张</option>
                <option value="2">2张</option>
                <option value="3">3张</option>
                <option value="5">5张</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onStartCreation}
            disabled={isGenerating || (!selectedTopic && !customTopic.trim())}
            className={`px-6 py-3 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isGenerating || (!selectedTopic && !customTopic.trim())
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isGenerating ? '创作中...' : '开始创作'}
          </button>
        </div>
      </div>
    </div>
  );
}