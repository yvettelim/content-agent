'use client';

interface LoadingProgressProps {
  currentStep: number;
  totalSteps: number;
  currentMessage: string;
  percentage?: number;
}

export function LoadingProgress({
  currentStep,
  totalSteps,
  currentMessage,
  percentage
}: LoadingProgressProps) {
  const progressPercentage = percentage || (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">正在进行选题分析...</h3>
        <span className="text-sm text-gray-600">
          步骤 {currentStep} / {totalSteps}
        </span>
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
          <span className="text-sm font-medium text-blue-600">{currentMessage}</span>
        </div>
      </div>

      {/* 详细步骤 */}
      <div className="space-y-2">
        <div className={`flex items-center space-x-3 text-sm ${
          currentStep >= 1 ? 'text-green-600' : 'text-gray-400'
        }`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            currentStep >= 1 ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {currentStep >= 1 ? '✓' : '1'}
          </div>
          <span>准备搜索参数</span>
        </div>

        <div className={`flex items-center space-x-3 text-sm ${
          currentStep >= 2 ? 'text-green-600' : currentStep === 2 ? 'text-blue-600' : 'text-gray-400'
        }`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            currentStep >= 2 ? 'bg-green-100' : currentStep === 2 ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {currentStep >= 2 ? '✓' : currentStep === 2 ? (
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : '2'}
          </div>
          <span>调用公众号API</span>
        </div>

        <div className={`flex items-center space-x-3 text-sm ${
          currentStep >= 3 ? 'text-green-600' : currentStep === 3 ? 'text-blue-600' : 'text-gray-400'
        }`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            currentStep >= 3 ? 'bg-green-100' : currentStep === 3 ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {currentStep >= 3 ? '✓' : currentStep === 3 ? (
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : '3'}
          </div>
          <span>处理和分析数据</span>
        </div>

        <div className={`flex items-center space-x-3 text-sm ${
          currentStep >= 4 ? 'text-green-600' : currentStep === 4 ? 'text-blue-600' : 'text-gray-400'
        }`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            currentStep >= 4 ? 'bg-green-100' : currentStep === 4 ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {currentStep >= 4 ? '✓' : currentStep === 4 ? (
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : '4'}
          </div>
          <span>生成洞察报告</span>
        </div>

        <div className={`flex items-center space-x-3 text-sm ${
          currentStep >= 5 ? 'text-green-600' : currentStep === 5 ? 'text-blue-600' : 'text-gray-400'
        }`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            currentStep >= 5 ? 'bg-green-100' : currentStep === 5 ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {currentStep >= 5 ? '✓' : '5'}
          </div>
          <span>保存结果</span>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 分析过程可能需要几秒钟时间，请耐心等待...
        </p>
      </div>
    </div>
  );
}