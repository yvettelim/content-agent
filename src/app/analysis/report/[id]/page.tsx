'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TopicAnalysis, WechatArticle } from '@/types';
import { getAnalysisResult } from '@/lib/analysisService';
import { InsightReport } from '@/components/analysis/InsightReport';
import { formatDate } from '@/lib/utils';

export default function ReportPage() {
  const params = useParams();
  const analysisId = params.id as string;

  const [analysis, setAnalysis] = useState<TopicAnalysis | null>(null);
  const [articles, setArticles] = useState<WechatArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getAnalysisResult(analysisId);

        if (result.analysis && result.articles) {
          setAnalysis(result.analysis);
          setArticles(result.articles);
        } else {
          setError('未找到分析报告');
        }
      } catch (error) {
        console.error('获取分析报告失败:', error);
        setError('获取分析报告失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    if (analysisId) {
      fetchData();
    }
  }, [analysisId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载分析报告中...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">{error || '分析报告不存在'}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部信息 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {analysis.keyword} - 分析报告
              </h1>
              <span className="text-sm text-gray-500">
                {formatDate(analysis.createdAt)}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                analysis.status === 'completed' ? 'bg-green-100 text-green-800' :
                analysis.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {analysis.status === 'completed' ? '已完成' :
                 analysis.status === 'failed' ? '失败' : '处理中'}
              </span>
              <button
                onClick={() => window.close()}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 报告内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <InsightReport analysis={analysis} articles={articles} />
      </div>
    </div>
  );
}