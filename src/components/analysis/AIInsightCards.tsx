'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, AlertCircle, TrendingUp, Target, BarChart, Rocket, Star } from 'lucide-react';
import { AIInsightSuggestion, TopicAnalysisSections } from '@/types';

interface InsightData {
  insights: AIInsightSuggestion[];
  topicAnalysis: TopicAnalysisSections;
  fromCache: boolean;
  createdAt?: string;
  expiresAt?: string;
  articleCount: number;
  avgEngagementRate: number;
  modelUsed: string;
  generatedAt?: string;
}

interface AIInsightCardsProps {
  keyword: string;
  analysisId: string;
  className?: string;
}

export function AIInsightCards({ keyword, analysisId, className = '' }: AIInsightCardsProps) {
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 生成洞察建议
  const generateInsights = async (forceRefresh = false) => {
    if (!keyword || !analysisId) return;

    if (forceRefresh) {
      setIsRegenerating(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword,
          analysisId,
          forceRefresh,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '生成洞察建议失败');
      }

      if (result.success) {
        setInsightData(result.data);
      } else {
        throw new Error(result.error || '生成洞察建议失败');
      }
    } catch (err) {
      console.error('生成洞察建议失败:', err);
      setError(err instanceof Error ? err.message : '生成洞察建议失败');
    } finally {
      setLoading(false);
      setIsRegenerating(false);
    }
  };

  // 初始加载
  useEffect(() => {
    generateInsights();
  }, [keyword, analysisId]);

  // 重新生成
  const handleRegenerate = () => {
    generateInsights(true);
  };

  // 加载状态
  if (loading && !insightData) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-gray-600">AI 正在分析数据，生成洞察建议...</span>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error && !insightData) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 ${className}`}>
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">生成洞察建议失败</h3>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => generateInsights()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重试</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI 洞察建议</h3>
            <p className="text-sm text-gray-500">
              基于 {insightData?.articleCount || 0} 篇热门文章的智能分析
            </p>
          </div>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>{isRegenerating ? '生成中...' : '重新生成'}</span>
        </button>
      </div>

      {/* 缓存状态提示 */}
      {insightData?.fromCache && (
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span className="text-sm text-blue-700">
            使用缓存结果（缓存至 {insightData.expiresAt ? new Date(insightData.expiresAt).toLocaleString() : '24小时后'} 过期）
          </span>
        </div>
      )}

      {/* Topic Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionListCard
          title="趋势 & 方向"
          icon={TrendingUp}
          items={insightData?.topicAnalysis?.trendsAndDirections || []}
        />
        <SectionListCard
          title="用户痛点聚合"
          icon={Target}
          items={insightData?.topicAnalysis?.userPainPoints || []}
        />
        <KeywordCard
          keywords={insightData?.topicAnalysis?.highFrequencyKeywords || []}
        />
        <SectionListCard
          title="内容结构共性"
          icon={BarChart}
          items={insightData?.topicAnalysis?.contentStructurePatterns || []}
        />
        <SectionListCard
          title="高互动内容特征"
          icon={Rocket}
          items={insightData?.topicAnalysis?.highEngagementTraits || []}
        />
        <SuggestionCard
          suggestions={
            insightData?.topicAnalysis?.reusableTopicSuggestions?.length
              ? insightData.topicAnalysis.reusableTopicSuggestions
              : insightData?.insights || []
          }
        />
      </div>

      {/* 数据统计信息 */}
      {insightData && (
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span>分析文章:</span>
              <span className="font-semibold text-gray-900">{insightData.articleCount} 篇</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>平均互动率:</span>
              <span className="font-semibold text-gray-900">{insightData.avgEngagementRate.toFixed(2)}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>AI 模型:</span>
              <span className="font-semibold text-gray-900">{insightData.modelUsed}</span>
            </div>
          </div>

          {insightData.generatedAt && (
            <div className="text-xs text-gray-500">
              生成时间: {new Date(insightData.generatedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionListCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof TrendingUp;
  items: string[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">暂无数据</p>
      ) : (
        <ul className="space-y-2 text-sm text-gray-700">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function KeywordCard({ keywords }: { keywords: string[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 col-span-1 lg:col-span-2">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
          <Star className="w-5 h-5 text-purple-600" />
        </div>
        <h4 className="text-base font-semibold text-gray-900">高频关键词</h4>
      </div>
      {keywords.length === 0 ? (
        <p className="text-sm text-gray-500">暂无关键词数据</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywords.map(keyword => (
            <span
              key={keyword}
              className="px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700"
            >
              #{keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SuggestionCard({ suggestions }: { suggestions: AIInsightSuggestion[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 col-span-1 lg:col-span-2">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-orange-600" />
        </div>
        <h4 className="text-base font-semibold text-gray-900">可复用选题</h4>
      </div>
      {suggestions.length === 0 ? (
        <p className="text-sm text-gray-500">暂无可用选题</p>
      ) : (
        <div className="space-y-4">
          {suggestions.map((insight, index) => (
            <div key={`${insight.title}-${index}`} className="p-4 rounded-xl border border-orange-100 bg-orange-50/40">
              <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{insight.reason}</p>
              {insight.dataSupport && (
                <p className="mt-2 text-xs text-gray-500">⚙️ {insight.dataSupport}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
