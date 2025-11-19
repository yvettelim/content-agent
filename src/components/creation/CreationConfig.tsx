'use client';

import { useState, useEffect } from 'react';
import { TopicAnalysis, AIInsightSuggestion } from '@/types';
import { fetchAnalysisHistory, fetchInsightSuggestions, InsightGenerationResult } from '@/lib/apiService';
import { formatDate } from '@/lib/utils';

export interface CreationStartConfig {
  sourceType: 'report' | 'custom';
  analysisId?: string;
  keyword?: string;
  topicIdea: string;
  customTopic?: string;
  articleLength: string;
  writingStyle: string;
  imageCount: string;
  insightMetadata?: {
    fromCache: boolean;
    articleCount: number;
    avgEngagementRate: number;
    modelUsed: string;
    generatedAt?: string;
  };
  selectedSuggestion?: AIInsightSuggestion;
}

interface CreationConfigProps {
  onStartCreation: (config: CreationStartConfig) => void;
  isGenerating: boolean;
}

export function CreationConfig({ onStartCreation, isGenerating }: CreationConfigProps) {
  const [sourceType, setSourceType] = useState<'report' | 'custom'>('report');
  const [analysisOptions, setAnalysisOptions] = useState<TopicAnalysis[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [insightData, setInsightData] = useState<InsightGenerationResult | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AIInsightSuggestion | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [articleLength, setArticleLength] = useState('800-1200');
  const [writingStyle, setWritingStyle] = useState('professional');
  const [imageCount, setImageCount] = useState('3');

  const resolveAnalysisField = <T,>(analysis: Record<string, any>, keys: string[], fallback: T): T => {
    for (const key of keys) {
      if (analysis && analysis[key] !== undefined && analysis[key] !== null) {
        return analysis[key] as T;
      }
    }
    return fallback;
  };

  const getArticleTotalLabel = (analysis: TopicAnalysis) =>
    resolveAnalysisField<number>(analysis as any, ['totalArticles', 'total_articles', 'articleCount', 'article_count'], 0);

  const getCreatedAtValue = (analysis: TopicAnalysis) =>
    resolveAnalysisField<string | null>(analysis as any, ['createdAt', 'created_at'], null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setAnalysisLoading(true);
        const result = await fetchAnalysisHistory(1, 20);
        const completed = (result.analyses || []).filter((item) => item.status === 'completed');
        setAnalysisOptions(completed);
        setAnalysisError(null);
      } catch (error) {
        console.error('加载分析记录失败:', error);
        setAnalysisError('加载洞察关键词失败，请稍后重试');
      } finally {
        setAnalysisLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleAnalysisChange = async (analysisId: string) => {
    setSelectedAnalysisId(analysisId);
    setSelectedSuggestion(null);
    setInsightData(null);
    setInsightError(null);

    const analysis = analysisOptions.find((item) => item.id === analysisId);

    if (!analysis) {
      setSelectedKeyword('');
      return;
    }

    setSelectedKeyword(analysis.keyword);

    try {
      setInsightLoading(true);
      const data = await fetchInsightSuggestions({
        keyword: analysis.keyword,
        analysisId: analysis.id,
      });
      setInsightData(data);
    } catch (error) {
      console.error('加载AI洞察建议失败:', error);
      setInsightError(error instanceof Error ? error.message : '加载AI洞察建议失败');
    } finally {
      setInsightLoading(false);
    }
  };

  const handleSourceChange = (value: 'report' | 'custom') => {
    setSourceType(value);
    if (value === 'custom') {
      setSelectedAnalysisId('');
      setSelectedKeyword('');
      setSelectedSuggestion(null);
      setInsightData(null);
      setInsightError(null);
    }
  };

  const canStartCreation = sourceType === 'report'
    ? Boolean(selectedAnalysisId && selectedSuggestion)
    : Boolean(customTopic.trim());

  const availableSuggestions = insightData?.topicAnalysis?.reusableTopicSuggestions?.length
    ? insightData.topicAnalysis.reusableTopicSuggestions
    : insightData?.insights || [];

  const handleStart = () => {
    if (!canStartCreation || isGenerating) {
      return;
    }

    const payload: CreationStartConfig = {
      sourceType,
      analysisId: sourceType === 'report' ? selectedAnalysisId : undefined,
      keyword: sourceType === 'report' ? selectedKeyword : undefined,
      topicIdea: sourceType === 'report' && selectedSuggestion ? selectedSuggestion.title : customTopic.trim(),
      customTopic: sourceType === 'custom' ? customTopic.trim() : undefined,
      articleLength,
      writingStyle,
      imageCount,
      insightMetadata: sourceType === 'report' && insightData ? {
        fromCache: insightData.fromCache,
        articleCount: insightData.articleCount,
        avgEngagementRate: insightData.avgEngagementRate,
        modelUsed: insightData.modelUsed,
        generatedAt: insightData.generatedAt,
      } : undefined,
      selectedSuggestion: sourceType === 'report' ? selectedSuggestion || undefined : undefined,
    };

    onStartCreation(payload);
  };

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
                onChange={(e) => handleSourceChange(e.target.value as 'report' | 'custom')}
                className="mr-2 text-primary-600 focus:ring-primary-500"
              />
              <span>从洞察报告选择</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="custom"
                checked={sourceType === 'custom'}
                onChange={(e) => handleSourceChange(e.target.value as 'report' | 'custom')}
                className="mr-2 text-primary-600 focus:ring-primary-500"
              />
              <span>自定义输入</span>
            </label>
          </div>
        </div>

        {sourceType === 'report' ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">选择关键词：</h3>
              <div className="space-y-2">
                {analysisLoading ? (
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2" />
                    正在加载洞察报告...
                  </div>
                ) : analysisError ? (
                  <p className="text-sm text-red-600">{analysisError}</p>
                ) : analysisOptions.length === 0 ? (
                  <div className="text-sm text-gray-600 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4">
                    暂无完成的选题分析，请先前往
                    <a href="/analysis" className="text-primary-600 font-medium mx-1">选题分析工作台</a>
                    生成洞察。
                  </div>
                ) : (
                  <select
                    value={selectedAnalysisId}
                    onChange={(e) => handleAnalysisChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">选择一个已完成的选题分析</option>
                    {analysisOptions.map((analysis) => {
                      const total = getArticleTotalLabel(analysis);
                      const createdAt = getCreatedAtValue(analysis);
                      return (
                        <option key={analysis.id} value={analysis.id}>
                          {analysis.keyword} · {total} 篇{createdAt ? ` · ${formatDate(createdAt)}` : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            </div>

            {selectedAnalysisId && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">当前关键词</p>
                    <p className="font-semibold text-gray-900">{selectedKeyword}</p>
                    {insightData && (
                      <p className="text-xs text-gray-500 mt-1">
                        基于 {insightData.articleCount} 篇文章 · 平均互动率 {insightData.avgEngagementRate.toFixed(2)}%
                      </p>
                    )}
                  </div>
                  {insightData?.fromCache && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      使用缓存
                    </span>
                  )}
                </div>

                {insightLoading ? (
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2" />
                    正在生成AI选题洞察...
                  </div>
                ) : insightError ? (
                  <p className="text-sm text-red-600">{insightError}</p>
                ) : availableSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    {availableSuggestions.map((insight, index) => (
                      <label
                        key={`${selectedAnalysisId}-${index}`}
                        className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer border ${
                          selectedSuggestion === insight ? 'border-primary-500 bg-white shadow-sm' : 'border-transparent hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="insight-topic"
                          value={insight.title}
                          checked={selectedSuggestion === insight}
                          onChange={() => setSelectedSuggestion(insight)}
                          className="mt-1 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">
                              {insight.title || `洞察建议 ${index + 1}`}
                            </p>
                            <span className="text-xs text-gray-500">推荐 {index + 1}</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">洞察理由</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{insight.reason}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">数据支持</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{insight.dataSupport}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">暂无AI洞察建议，请刷新或稍后重试</p>
                )}
              </div>
            )}
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
            onClick={handleStart}
            disabled={isGenerating || !canStartCreation}
            className={`px-6 py-3 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isGenerating || !canStartCreation
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
