'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

const navItems = [
  { href: '/', label: '仪表盘', icon: '📊' },
  { href: '/analysis', label: '选题分析', icon: '🔍' },
  { href: '/create', label: '内容创作', icon: '✍️' },
  { href: '/publish', label: '发布管理', icon: '📱' },
  { href: '/settings', label: '设置', icon: '⚙️' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">内容工厂 Agent</h1>
          </div>
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}