'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: '仪表盘', icon: '📊', color: 'text-blue-500' },
  { href: '/analysis', label: '选题分析', icon: '🔍', color: 'text-purple-500' },
  { href: '/create', label: '内容创作', icon: '✍️', color: 'text-green-500' },
  { href: '/publish', label: '发布管理', icon: '📱', color: 'text-orange-500' },
  { href: '/settings', label: '设置', icon: '⚙️', color: 'text-gray-500' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* 移动端遮罩 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden hidden"></div>

      {/* 侧边栏 */}
      <div className={`
        fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo 区域 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-gray-900">内容工厂</h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200 ease-in-out
                      ${isActive
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className={`text-xl flex-shrink-0 ${isActive ? 'text-blue-600' : item.color}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* 底部用户信息 */}
          <div className="p-4 border-t border-gray-200">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  U
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">用户</p>
                  <p className="text-xs text-gray-500">免费版本</p>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mx-auto">
                U
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}