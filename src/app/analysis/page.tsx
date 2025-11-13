'use client';

import { useState } from 'react';
import { SearchConfig } from '@/components/analysis/SearchConfig';
import { LoadingProgress } from '@/components/analysis/LoadingProgress';
import { ErrorMessage } from '@/components/analysis/ErrorMessage';
import { InsightReport } from '@/components/analysis/InsightReport';
import { AnalysisHistory } from '@/components/analysis/AnalysisHistory';
import { performTopicAnalysis, AnalysisConfig, AnalysisProgress } from '@/lib/analysisService';
import { TopicAnalysis, WechatArticle } from '@/types';

export default function AnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<TopicAnalysis | null>(null);
  const [currentArticles, setCurrentArticles] = useState<WechatArticle[]>([]);
  const [progress, setProgress] = useState<AnalysisProgress>({
    currentStep: 0,
    totalSteps: 5,
    currentMessage: '',
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const handleStartAnalysis = async (config: AnalysisConfig) => {
    setIsAnalyzing(true);
    setHasResults(false);
    setCurrentAnalysis(null);
    setCurrentArticles([]);
    setError(null);

    try {
      const result = await performTopicAnalysis(config, (progressData) => {
        setProgress(progressData);
      });

      setCurrentAnalysis(result.analysis);
      setCurrentArticles(result.articles);
      setHasResults(true);
    } catch (error) {
      console.error('分析失败:', error);
      setError(error instanceof Error ? error.message : '分析过程中发生未知错误');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetry = () => {
    // 重试逻辑 - 可以保存之前的配置
    setError(null);
    // 这里可以恢复之前的搜索配置
  };

  const handleBack = () => {
    setError(null);
    setIsAnalyzing(false);
    setHasResults(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">选题分析工作台</h1>
        <p className="text-gray-600">分析热门话题，获取创作灵感</p>
      </div>

      {!isAnalyzing && !hasResults && !error && (
        <SearchConfig onStartAnalysis={handleStartAnalysis} />
      )}

      {isAnalyzing && (
        <LoadingProgress
          currentStep={progress.currentStep}
          totalSteps={progress.totalSteps}
          currentMessage={progress.currentMessage}
          percentage={progress.percentage}
        />
      )}

      {error && (
        <ErrorMessage
          error={error}
          onRetry={handleRetry}
          onBack={handleBack}
        />
      )}

      {hasResults && currentAnalysis && currentArticles.length > 0 && (
        <InsightReport
          analysis={currentAnalysis}
          articles={currentArticles}
        />
      )}

      {/* 历史记录总是显示 */}
      <AnalysisHistory />
    </div>
  );
}