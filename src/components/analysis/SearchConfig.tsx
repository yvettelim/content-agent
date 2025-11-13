'use client';

import { useState } from 'react';

interface SearchConfigProps {
  onStartAnalysis: (config: {
    keyword: string;
    articleCount: number;
    timeRange: number;
    includeAnyKeywords?: string;
    excludeKeywords?: string;
  }) => void;
}

export function SearchConfig({ onStartAnalysis }: SearchConfigProps) {
  const [keyword, setKeyword] = useState('');
  const [articleCount, setArticleCount] = useState('50');
  const [timeRange, setTimeRange] = useState('30');
  const [includeAnyKeywords, setIncludeAnyKeywords] = useState('');
  const [excludeKeywords, setExcludeKeywords] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onStartAnalysis({
        keyword: keyword.trim(),
        articleCount: parseInt(articleCount),
        timeRange: parseInt(timeRange),
        includeAnyKeywords: includeAnyKeywords.trim(),
        excludeKeywords: excludeKeywords.trim(),
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">搜索配置</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 基础配置 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              关键词 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="请输入分析关键词，如：AI工具"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文章数量
            </label>
            <select
              value={articleCount}
              onChange={(e) => setArticleCount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="20">20篇</option>
              <option value="50">50篇</option>
              <option value="100">100篇</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时间范围
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7">最近7天</option>
              <option value="30">最近30天</option>
              <option value="90">最近90天</option>
            </select>
          </div>
        </div>

        {/* 高级配置 */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">高级配置</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                包含任意关键词（可选）
              </label>
              <input
                type="text"
                value={includeAnyKeywords}
                onChange={(e) => setIncludeAnyKeywords(e.target.value)}
                placeholder="用空格分隔多个关键词"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                排除关键词（可选）
              </label>
              <input
                type="text"
                value={excludeKeywords}
                onChange={(e) => setExcludeKeywords(e.target.value)}
                placeholder="用空格分隔多个要排除的关键词"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* 数据源信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">ℹ️</span>
            <div className="text-sm text-blue-700">
              <p className="font-medium">数据源：公众号文章API</p>
              <p>系统将根据您的配置搜索公众号文章，并生成选题分析报告</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!keyword.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            开始分析
          </button>
        </div>
      </form>
    </div>
  );
}