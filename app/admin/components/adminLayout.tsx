import type { ReactNode } from 'react';
import AdminNav from './adminNav';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ease-in-out">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 py-8 transition-all duration-300 ease-in-out">
        <div className="animate-fadeIn">
          {children}
        </div>
      </div>
    </div>
  );
} 