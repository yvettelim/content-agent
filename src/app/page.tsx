import { QuickActions } from '@/components/QuickActions';
import { StatsCards } from '@/components/StatsCards';
import { RecentAnalyses } from '@/components/RecentAnalyses';
import { RecentPublications } from '@/components/RecentPublications';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* 页面标题区域 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-2">内容工厂仪表盘</h1>
          <p className="text-blue-100 text-lg">欢迎回来！这里是您的内容创作概览</p>
        </div>
      </div>

      {/* 快速操作和统计数据 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <QuickActions />
        </div>
        <div>
          <StatsCards />
        </div>
      </div>

      {/* 最近记录 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAnalyses />
        <RecentPublications />
      </div>
    </div>
  );
}