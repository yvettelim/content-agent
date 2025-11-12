'use client';

import { useState } from 'react';
import { SearchConfig } from '@/components/analysis/SearchConfig';
import { AnalysisStatus } from '@/components/analysis/AnalysisStatus';
import { InsightReport } from '@/components/analysis/InsightReport';
import { AnalysisHistory } from '@/components/analysis/AnalysisHistory';

export default function AnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    // 模拟分析过程
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasResults(true);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">选题分析工作台</h1>
        <p className="text-gray-600">分析热门话题，获取创作灵感</p>
      </div>

      <SearchConfig onStartAnalysis={handleStartAnalysis} />

      {isAnalyzing && <AnalysisStatus />}

      {hasResults && <InsightReport />}

      <AnalysisHistory />
    </div>
  );
}