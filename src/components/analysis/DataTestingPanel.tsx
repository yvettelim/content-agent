'use client';

import { useState } from 'react';
import { WechatArticle } from '@/types';
import { generateDataQualityReport, validateArticlesData } from '@/lib/dataValidation';

interface DataTestingPanelProps {
  articles: WechatArticle[];
  onShowQualityReport?: (report: any) => void;
}

export function DataTestingPanel({ articles, onShowQualityReport }: DataTestingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<WechatArticle | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const handleDataValidation = () => {
    if (articles.length === 0) {
      alert('没有数据可验证');
      return;
    }

    const report = generateDataQualityReport(articles);
    setTestResults(report);

    if (onShowQualityReport) {
      onShowQualityReport(report);
    }
  };

  const handleFieldTesting = () => {
    if (articles.length === 0) return;

    // 随机选择一篇文章进行字段测试
    const randomIndex = Math.floor(Math.random() * articles.length);
    setSelectedArticle(articles[randomIndex]);
  };

  const formatNumber = (num: number | undefined): string => {
    if (typeof num !== 'number') return 'N/A';
    return num.toLocaleString();
  };

  const formatDate = (timestamp: number | undefined): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  const getEngagementColor = (rate: number): string => {
    if (rate < 1) return 'text-red-600';
    if (rate < 3) return 'text-yellow-600';
    if (rate < 8) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🧪 数据测试面板</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          {isExpanded ? '收起' : '展开'}
        </button>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleDataValidation}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          📊 数据质量验证
        </button>
        <button
          onClick={handleFieldTesting}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          🔍 字段测试
        </button>
      </div>

      {/* 验证结果概览 */}
      {testResults && (
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">📈 验证结果概览</h4>
          <p className="text-sm text-gray-600 mb-2">{testResults.summary}</p>

          {testResults.recommendations.length > 0 && (
            <div className="mt-3">
              <h5 className="font-medium text-gray-900 mb-1">💡 建议:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {testResults.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 字段测试详情 */}
      {selectedArticle && (
        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="font-medium text-gray-900 mb-3">🔍 字段测试详情</h4>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 基本信息 */}
              <div className="space-y-2">
                <h5 className="font-medium text-gray-700">基本信息</h5>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">标题:</span> {selectedArticle.title}</div>
                  <div><span className="font-medium">公众号:</span> {selectedArticle.wx_name}</div>
                  <div><span className="font-medium">发布时间:</span> {formatDate(selectedArticle.publish_time)}</div>
                  <div><span className="font-medium">是否原创:</span> {selectedArticle.is_original === 1 ? '是' : '否'}</div>
                </div>
              </div>

              {/* 互动数据 */}
              <div className="space-y-2">
                <h5 className="font-medium text-gray-700">互动数据</h5>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">阅读量:</span> <span className="text-blue-600">{formatNumber(selectedArticle.read)}</span></div>
                  <div><span className="font-medium">点赞数:</span> <span className="text-red-600">{formatNumber(selectedArticle.praise)}</span></div>
                  <div><span className="font-medium">在看数:</span> <span className="text-green-600">{formatNumber(selectedArticle.looking)}</span></div>
                  {(() => {
                    const read = selectedArticle.read || 0;
                    const praise = selectedArticle.praise || 0;
                    const looking = selectedArticle.looking || 0;
                    const rate = read > 0 ? ((praise + looking) / read * 100) : 0;
                    return (
                      <div><span className="font-medium">互动率:</span> <span className={getEngagementColor(rate)}>{rate.toFixed(2)}%</span></div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* 数据完整性检查 */}
            <div>
              <h5 className="font-medium text-gray-700 mb-2">数据完整性检查</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className={`px-2 py-1 rounded text-center ${
                  selectedArticle.title ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  标题: {selectedArticle.title ? '✅' : '❌'}
                </div>
                <div className={`px-2 py-1 rounded text-center ${
                  selectedArticle.content ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  内容: {selectedArticle.content ? '✅' : '❌'}
                </div>
                <div className={`px-2 py-1 rounded text-center ${
                  selectedArticle.url ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  链接: {selectedArticle.url ? '✅' : '❌'}
                </div>
                <div className={`px-2 py-1 rounded text-center ${
                  (selectedArticle.read || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  阅读量: {(selectedArticle.read || 0) > 0 ? '✅' : '⚠️'}
                </div>
              </div>
            </div>

            {/* 数据合理性检查 */}
            <div>
              <h5 className="font-medium text-gray-700 mb-2">数据合理性检查</h5>
              <div className="text-sm space-y-1">
                {(() => {
                  const issues: string[] = [];
                  const read = selectedArticle.read || 0;
                  const praise = selectedArticle.praise || 0;
                  const looking = selectedArticle.looking || 0;

                  if (read === 0) {
                    issues.push('⚠️ 阅读量为0');
                  } else {
                    if (praise > read) issues.push('❌ 点赞数 > 阅读数');
                    if (looking > read) issues.push('❌ 在看数 > 阅读数');
                    if ((praise + looking) / read > 0.3) issues.push('⚠️ 互动率异常高');
                  }

                  if (issues.length === 0) {
                    return <div className="text-green-600">✅ 数据检查通过</div>;
                  } else {
                    return issues.map((issue, index) => (
                      <div key={index} className="text-yellow-600">{issue}</div>
                    ));
                  }
                })()}
              </div>
            </div>

            {/* 原文链接 */}
            {selectedArticle.url && (
              <div>
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <span>🔗 查看原文进行对比</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 统计信息 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div>当前数据集: {articles.length} 篇文章</div>
          {articles.length > 0 && (
            <div>
              平均阅读量: {formatNumber(Math.round(articles.reduce((sum, a) => sum + (a.read || 0), 0) / articles.length))}
              {', '}
              平均点赞数: {formatNumber(Math.round(articles.reduce((sum, a) => sum + (a.praise || 0), 0) / articles.length))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}