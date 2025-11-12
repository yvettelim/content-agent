'use client';

import { useState } from 'react';
import { ApiConfig } from '@/components/settings/ApiConfig';
import { SystemParams } from '@/components/settings/SystemParams';
import { HistoryManagement } from '@/components/settings/HistoryManagement';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api');

  const tabs = [
    { id: 'api', label: 'API配置', icon: '🔧' },
    { id: 'system', label: '系统参数', icon: '⚙️' },
    { id: 'history', label: '历史记录', icon: '📊' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">设置</h1>
        <p className="text-gray-600">配置系统参数和管理历史记录</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'api' && <ApiConfig />}
          {activeTab === 'system' && <SystemParams />}
          {activeTab === 'history' && <HistoryManagement />}
        </div>
      </div>
    </div>
  );
}