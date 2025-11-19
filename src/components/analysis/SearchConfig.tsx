'use client';

import { useState } from 'react';

interface SearchConfigProps {
  onStartAnalysis: (config: {
    keyword: string;
    articleCount: number;
    timeRange: number;
    includeAnyKeywords?: string;
    excludeKeywords?: string;
    wxid?: string;
    collectionMode: 'keyword' | 'account'; // 搜索模式
  }) => void;
}

export function SearchConfig({ onStartAnalysis }: SearchConfigProps) {
  const [keyword, setKeyword] = useState('');
  const [articleCount, setArticleCount] = useState('20');
  const [timeRange, setTimeRange] = useState('30');
  const [includeAnyKeywords, setIncludeAnyKeywords] = useState('');
  const [excludeKeywords, setExcludeKeywords] = useState('');
  const [wxid, setWxid] = useState(''); // 公众号ID
  const [collectionMode, setCollectionMode] = useState<'keyword' | 'account'>('keyword'); // 默认关键词搜索

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证输入
    if (collectionMode === 'keyword' && !keyword.trim()) {
      alert('请输入搜索关键词');
      return;
    }

    if (collectionMode === 'account' && !wxid.trim() && !keyword.trim()) {
      alert('请输入公众号ID或搜索关键词');
      return;
    }

    onStartAnalysis({
      keyword: keyword.trim(),
      articleCount: parseInt(articleCount),
      timeRange: parseInt(timeRange),
      includeAnyKeywords: includeAnyKeywords.trim(),
      excludeKeywords: excludeKeywords.trim(),
      wxid: collectionMode === 'account' ? wxid.trim() : undefined,
      collectionMode,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">搜索配置</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 搜索模式选择 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">搜索模式</label>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                value="keyword"
                checked={collectionMode === 'keyword'}
                onChange={(e) => setCollectionMode(e.target.value as 'keyword')}
                className="mr-2"
              />
              <div>
                <span className="font-medium">关键词搜索文章</span>
                <p className="text-xs text-gray-500">搜索包含关键词的所有公众号文章</p>
              </div>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="account"
                checked={collectionMode === 'account'}
                onChange={(e) => setCollectionMode(e.target.value as 'account')}
                className="mr-2"
              />
              <div>
                <span className="font-medium">指定公众号采集</span>
                <p className="text-xs text-gray-500">采集特定公众号的最新文章 (成本低)</p>
              </div>
            </label>
          </div>
        </div>

        {/* 基础配置 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {collectionMode === 'keyword' ? (
            // 关键词搜索模式
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  搜索关键词 <span className="text-red-500">*</span>
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
                  <option value="10">10篇</option>
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
            </>
          ) : (
            // 公众号采集模式
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  公众号ID
                </label>
                <input
                  type="text"
                  value={wxid}
                  onChange={(e) => setWxid(e.target.value)}
                  placeholder="如: gh_e036770fc439"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  或搜索公众号
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="如: 丁香医生"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <option value="10">10篇</option>
                  <option value="20">20篇</option>
                  <option value="50">50篇</option>
                  <option value="100">100篇</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* 高级配置 - 仅关键词搜索模式 */}
        {collectionMode === 'keyword' && (
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
        )}

        {/* 数据源信息 */}
        <div className={`${collectionMode === 'account' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-3`}>
          <div className="flex items-center space-x-2">
            <span className={collectionMode === 'account' ? 'text-green-600' : 'text-blue-600'}>ℹ️</span>
            <div className="text-sm text-gray-700">
              <p className="font-medium">
                {collectionMode === 'account' ? '指定公众号采集' : '关键词搜索文章'}
              </p>
              {collectionMode === 'account' ? (
                <div className="mt-1">
                  <p>• 使用新版API，三阶段并行采集，成本低</p>
                  <p>• 支持直接输入公众号ID或通过关键词搜索公众号</p>
                  <p>• 可选择性采集文章内容和互动数据，进一步控制成本</p>
                  <p>• 实时获取指定公众号的最新文章数据</p>
                </div>
              ) : (
                <div className="mt-1">
                  <p>• 使用新的搜一搜API，实时获取最新文章</p>
                  <p>• 搜索包含指定关键词的所有公众号文章</p>
                  <p>• 自动采集文章详细内容和互动数据</p>
                  <p>• 适合热点话题分析和选题研究</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={
              collectionMode === 'keyword'
                ? !keyword.trim()
                : !(wxid.trim() || keyword.trim())
            }
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {collectionMode === 'account' ? '开始采集' : '开始搜索'}
          </button>
        </div>
      </form>
    </div>
  );
}