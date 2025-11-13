'use client';

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorMessage({ error, onRetry, onBack }: ErrorMessageProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">分析失败</h3>
          <p className="text-sm text-gray-600">很抱歉，分析过程中出现了错误</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-2">
          <span className="text-red-600 mt-1">❌</span>
          <div>
            <p className="text-sm font-medium text-red-800">错误信息:</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>

      {/* 可能的解决方案 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 mt-1">💡</span>
          <div>
            <p className="text-sm font-medium text-blue-800">可能的解决方案:</p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• 检查关键词是否正确，避免使用特殊字符</li>
              <li>• 稍后重试，可能是网络连接问题</li>
              <li>• 尝试使用不同的关键词或时间范围</li>
              <li>• 如果问题持续存在，请联系技术支持</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center space-x-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            重新分析
          </button>
        )}
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            返回配置
          </button>
        )}
      </div>
    </div>
  );
}