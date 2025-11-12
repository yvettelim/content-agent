'use client';

interface FilterAndSearchProps {
  selectedCount: number;
  onSelectAll: () => void;
}

export function FilterAndSearch({ selectedCount, onSelectAll }: FilterAndSearchProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>全部</option>
              <option>草稿</option>
              <option>待审核</option>
              <option>已发布</option>
              <option>审核失败</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">时间</label>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>最近7天</option>
              <option>最近30天</option>
              <option>最近90天</option>
              <option>全部时间</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="搜索文章标题..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                🔍
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {selectedCount > 0 && (
            <>
              <span className="text-sm text-gray-600">已选择 {selectedCount} 篇</span>
              <button className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                批量发布
              </button>
              <button className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                批量删除
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}