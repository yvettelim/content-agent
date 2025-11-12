'use client';

import { useState, useEffect } from 'react';

export function AnalysisStatus() {
  const [progress, setProgress] = useState({
    step: 1,
    articleProgress: 0,
    analysisProgress: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => ({
        ...prev,
        articleProgress: Math.min(prev.articleProgress + 5, 100),
        analysisProgress: Math.max(0, prev.analysisProgress + 2),
        step: prev.articleProgress >= 100 ? 2 : prev.step
      }));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      name: '抓取文章',
      icon: '🔄',
      status: progress.articleProgress >= 100 ? 'completed' : 'active',
      progress: progress.articleProgress
    },
    {
      name: 'AI分析',
      icon: '📝',
      status: progress.articleProgress >= 100 ? 'active' : 'pending',
      progress: progress.analysisProgress
    },
    {
      name: '生成洞察',
      icon: '📊',
      status: progress.analysisProgress >= 100 ? 'active' : 'pending',
      progress: 0
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">分析状态</h2>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className={`text-2xl ${step.status === 'active' ? 'animate-spin' : ''}`}>
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{step.name}</span>
                {step.progress > 0 && step.progress < 100 && (
                  <span className="text-sm text-gray-500">{step.progress}%</span>
                )}
                {step.progress === 100 && (
                  <span className="text-sm text-green-600">✓ 完成</span>
                )}
              </div>
              {step.status === 'active' && step.progress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${step.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}

        {progress.step === 1 && (
          <p className="text-sm text-gray-600 text-center">
            正在抓取文章... ({Math.floor(progress.articleProgress * 50 / 100)}/50)
          </p>
        )}

        {progress.step === 2 && (
          <p className="text-sm text-gray-600 text-center">
            AI分析中... ({Math.floor(progress.analysisProgress * 50 / 100)}/50)
          </p>
        )}

        {progress.analysisProgress >= 100 && (
          <p className="text-sm text-green-600 text-center font-medium">
            生成洞察报告...
          </p>
        )}
      </div>
    </div>
  );
}