'use client';

import { useState } from 'react';
import { TopicAnalysis, WechatArticle } from '@/types';
import { generateInsightReport } from '@/lib/analysisService';

interface InsightReportProps {
  analysis: TopicAnalysis;
  articles: WechatArticle[];
}

export function InsightReport({ analysis, articles }: InsightReportProps) {
  const [showAllArticles, setShowAllArticles] = useState(false);

  const insightData = generateInsightReport(articles);
  const { topLikedArticles, topEngagementArticles, wordCloud, insights, summary } = insightData;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ analysis, articles }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-${analysis.keyword}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatReadCount = (count: number | undefined) => {
    if (!count || count === 0) return '0';
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    return count.toLocaleString();
  };

  // 计算字体大小
  const getFontSize = (count: number, maxCount: number) => {
    const minSize = 12;
    const maxSize = 32;
    const ratio = count / maxCount;
    return minSize + (maxSize - minSize) * ratio;
  };

  // 计算颜色
  const getColor = (index: number) => {
    const colors = [
      'text-blue-600',
      'text-green-600',
      'text-purple-600',
      'text-red-600',
      'text-orange-600',
      'text-teal-600',
      'text-indigo-600',
      'text-pink-600'
    ];
    return colors[index % colors.length];
  };

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>暂无分析数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部操作按钮 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          「{analysis.keyword}」分析报告
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            🖨️ 打印报告
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            📥 导出数据
          </button>
          <button
            onClick={() => setShowAllArticles(!showAllArticles)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            📄 查看所有文章
          </button>
        </div>
      </div>

      {/* 数据概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">文章总数</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalArticles}</p>
            </div>
            <div className="text-blue-600 text-3xl">📄</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均互动率</p>
              <p className="text-2xl font-bold text-gray-900">{summary.avgEngagementRate.toFixed(2)}%</p>
            </div>
            <div className="text-green-600 text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均阅读量</p>
              <p className="text-2xl font-bold text-gray-900">{formatReadCount(summary.avgReadCount)}</p>
            </div>
            <div className="text-purple-600 text-3xl">👁️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均点赞数</p>
              <p className="text-2xl font-bold text-gray-900">{formatReadCount(summary.avgPraiseCount)}</p>
            </div>
            <div className="text-red-600 text-3xl">❤️</div>
          </div>
        </div>
      </div>

      {/* 词云图 */}
      {wordCloud.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 热门关键词</h3>
          <div className="flex flex-wrap gap-3 items-center justify-center min-h-[200px] p-4">
            {wordCloud.map((item, index) => {
              const fontSize = getFontSize(item.count, wordCloud[0].count);
              return (
                <span
                  key={item.word}
                  className={`${getColor(index)} hover:opacity-80 transition-opacity cursor-pointer font-medium`}
                  style={{ fontSize: `${fontSize}px` }}
                  title={`${item.word}: ${item.count}次`}
                >
                  {item.word}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 阅读量分布 */}
      {summary.readCountDistribution && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 阅读量分布</h3>
          <div className="space-y-3">
            {summary.readCountDistribution.map((item) => (
              <div key={item.range} className="flex items-center">
                <div className="w-20 text-sm text-gray-600">{item.label}</div>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-blue-600 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ width: `${summary.totalArticles > 0 ? (item.count / summary.totalArticles) * 100 : 0}%` }}
                  >
                    {item.count > 0 && `${Math.round((item.count / summary.totalArticles) * 100)}%`}
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-900 text-right">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 发布时间分布 */}
      {summary.publishTimeDistribution && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⏰ 发布时间分布</h3>
          <div className="space-y-3">
            {summary.publishTimeDistribution.map((item) => (
              <div key={item.range} className="flex items-center">
                <div className="w-24 text-sm text-gray-600">{item.label}</div>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-green-600 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ width: `${summary.totalArticles > 0 ? (item.count / summary.totalArticles) * 100 : 0}%` }}
                  >
                    {item.count > 0 && `${Math.round((item.count / summary.totalArticles) * 100)}%`}
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-900 text-right">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 热门文章榜 */}
        {topLikedArticles.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 热门文章榜</h3>
            <div className="space-y-4">
              {topLikedArticles.map((article, index) => (
                <div key={article.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 cursor-pointer">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      👍 {article.likeCount.toLocaleString()} 赞
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 高互动文章榜 */}
        {topEngagementArticles.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 高互动文章榜</h3>
            <div className="space-y-4">
              {topEngagementArticles.map((article, index) => (
                <div key={article.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 cursor-pointer">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      互动率 {article.engagementRate}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 洞察建议 */}
      {insights.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 洞察建议</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="text-yellow-500 text-xl">💡</span>
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 文章列表弹窗 */}
      {showAllArticles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                所有文章 ({articles.length} 篇)
              </h3>
              <button
                onClick={() => setShowAllArticles(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {articles.map((article, index) => (
                  <div key={`${article.title}-${index}`} className="border-b border-gray-200 pb-4">
                    <h4 className="font-medium text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                      {article.title}
                    </h4>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{article.wx_name}</span>
                      <div className="flex items-center space-x-4">
                        <span>👁️ {formatReadCount(article.read)}</span>
                        <span>❤️ {formatReadCount(article.praise)}</span>
                        {article.looking && article.looking > 0 && (
                          <span>💬 {formatReadCount(article.looking)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}