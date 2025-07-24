import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // localStorage에서 로그인 상태 확인
    const adminLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    setIsAuthenticated(adminLoggedIn);

    if (!adminLoggedIn) {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      window.location.href = '/admin/login';
    }
  }, []);

  // 로딩 중이거나 인증되지 않은 경우
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 (리다이렉트 중)
  if (!isAuthenticated) {
    return null;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
} 