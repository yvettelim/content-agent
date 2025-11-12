'use client';

import { useState } from 'react';

export function PreviewArea() {
  const [title, setTitle] = useState('AI工具提升工作效率的5个实用技巧');
  const [content, setContent] = useState(`在数字化时代，人工智能工具已经成为提升工作效率的重要助手。本文将为您介绍5个实用的AI工具使用技巧，帮助您在工作中事半功倍。

## 1. 智能文档处理

使用AI驱动的文档处理工具，可以快速完成文档的整理、分类和关键信息提取。这些工具能够自动识别文档类型，提取重要数据，大大减少手动操作的时间。

## 2. 邮件自动化回复

AI邮件助手可以帮助您快速处理日常邮件。通过学习您的回复习惯，AI能够生成个性化的回复建议，让邮件处理更加高效。

## 3. 会议纪要自动生成

利用语音识别和自然语言处理技术，AI工具可以自动将会议录音转化为结构化的会议纪要，包括议题、决策和行动项。

## 4. 数据分析辅助

AI数据分析工具能够快速处理大量数据，识别趋势和模式，生成可视化报告，为决策提供有力支持。

## 5. 任务智能调度

通过学习您的工作习惯和优先级，AI助手可以帮助您合理安排任务时间，提醒重要事项，确保工作有序进行。

通过合理使用这些AI工具，您可以显著提升工作效率，将更多时间专注于创造性工作。记住，工具是辅助，关键还是要结合实际需求灵活运用。`);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">预览区</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文章标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            正文内容
          </label>
          <div className="border border-gray-300 rounded-md">
            <div className="min-h-[400px] p-4 bg-gray-50">
              <div className="prose prose-sm max-w-none">
                {content.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('##')) {
                    return (
                      <h2 key={index} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                        {paragraph.replace('##', '').trim()}
                      </h2>
                    );
                  }
                  if (paragraph.trim()) {
                    return (
                      <p key={index} className="text-gray-700 mb-2 leading-relaxed">
                        {paragraph}
                        {index === 2 && (
                          <div className="my-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <img
                              src="/api/placeholder/400/200"
                              alt="AI工具示意图"
                              className="w-full h-48 object-cover rounded mb-2"
                            />
                            <p className="text-sm text-gray-600 text-center">图片1: AI工作流程图</p>
                          </div>
                        )}
                        {index === 6 && (
                          <div className="my-4 p-3 bg-green-50 border border-green-200 rounded">
                            <img
                              src="/api/placeholder/400/200"
                              alt="数据分析图表"
                              className="w-full h-48 object-cover rounded mb-2"
                            />
                            <p className="text-sm text-gray-600 text-center">图片2: 数据分析示例</p>
                          </div>
                        )}
                        {index === 8 && (
                          <div className="my-4 p-3 bg-purple-50 border border-purple-200 rounded">
                            <img
                              src="/api/placeholder/400/200"
                              alt="任务调度界面"
                              className="w-full h-48 object-cover rounded mb-2"
                            />
                            <p className="text-sm text-gray-600 text-center">图片3: 智能调度界面</p>
                          </div>
                        )}
                      </p>
                    );
                  }
                  return <br key={index} />;
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            保存草稿
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            预览
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            提交审核
          </button>
        </div>
      </div>
    </div>
  );
}