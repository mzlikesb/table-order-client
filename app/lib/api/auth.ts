import type { ApiResponse } from '../../types/api';

const API_BASE_URL = 'http://dongyo.synology.me:14000/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    isSuperAdmin: boolean;
  };
  stores: Array<{
    id: string;
    name: string;
    code: string;
    role: string;
  }>;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
      console.log('로그인 시도:', credentials.username);
      
      // 서버 코드에 맞는 올바른 엔드포인트
      const authEndpoints = [
        '/auth/login'  // 서버에서 /api/auth/login으로 라우팅됨
      ];
      
      let lastError = '';
      
      for (const endpoint of authEndpoints) {
        try {
          console.log(`시도 중: ${API_BASE_URL}${endpoint}`);
          
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });
          
          console.log(`${endpoint} 응답 상태:`, response.status);
          
          if (response.status === 429) {
            console.warn('Rate limit 도달, 잠시 대기...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
            continue;
          }
          
          if (response.ok) {
            const data = await response.json();
            console.log('로그인 성공:', data);
            
            // 토큰을 localStorage에 저장
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data.user));
            localStorage.setItem('userStores', JSON.stringify(data.stores));
            
            return { success: true, data };
          } else {
            const errorData = await response.json().catch(() => ({}));
            lastError = errorData.error || `HTTP ${response.status}`;
            console.log(`${endpoint} 실패:`, errorData);
          }
        } catch (error) {
          console.log(`${endpoint} 시도 실패:`, error);
          lastError = '네트워크 오류';
        }
      }
      
      console.error('모든 인증 엔드포인트 실패');
      return { 
        success: false, 
        error: lastError || '로그인에 실패했습니다.' 
      };
    } catch (error) {
      console.error('로그인 API 오류:', error);
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userInfo');
    console.log('로그아웃 완료');
  },

  getCurrentUser: () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // 현재 사용자 정보 확인
  getCurrentUserInfo: () => {
    const userInfo = localStorage.getItem('userInfo');
    const stores = localStorage.getItem('userStores');
    
    console.log('현재 사용자 정보:', userInfo ? JSON.parse(userInfo) : '없음');
    console.log('사용자 스토어 정보:', stores ? JSON.parse(stores) : '없음');
    
    return {
      user: userInfo ? JSON.parse(userInfo) : null,
      stores: stores ? JSON.parse(stores) : []
    };
  },

  // 토큰 갱신 (필요한 경우)
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    try {
      const currentToken = localStorage.getItem('authToken');
      
      if (!currentToken) {
        return { success: false, error: '토큰이 없습니다.' };
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
      });
      
      if (!response.ok) {
        return { success: false, error: '토큰 갱신에 실패했습니다.' };
      }
      
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      
      return { success: true, data };
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      return { success: false, error: '토큰 갱신 중 오류가 발생했습니다.' };
    }
  }
}; 