const API_BASE_URL = 'http://dongyo.synology.me:14000/api';

export const testApi = {
  // 서버 상태 확인
  checkServer: async () => {
    try {
      console.log('서버 상태 확인 중...');
      const response = await fetch(`${API_BASE_URL}/health`);
      console.log('서버 상태:', response.status, response.statusText);
      return response.ok;
    } catch (error) {
      console.error('서버 연결 실패:', error);
      return false;
    }
  },

  // 사용 가능한 엔드포인트 확인
  checkEndpoints: async () => {
    const endpoints = [
      '/auth/login',
      '/login', 
      '/admin/login',
      '/api/auth/login',
      '/api/login',
      '/stores',
      '/health',
      '/'
    ];

    console.log('엔드포인트 확인 중...');
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log(`${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`${endpoint}: 연결 실패`);
      }
    }
  },

  // 인증 없이 stores 엔드포인트 테스트
  testStoresWithoutAuth: async () => {
    try {
      console.log('인증 없이 stores 테스트...');
      const response = await fetch(`${API_BASE_URL}/stores`);
      console.log('Stores 응답:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Stores 데이터:', data);
      } else {
        const errorText = await response.text();
        console.log('Stores 오류:', errorText);
      }
    } catch (error) {
      console.error('Stores 테스트 실패:', error);
    }
  },

  // 로그인 테스트
  testLogin: async (username: string, password: string) => {
    try {
      console.log('로그인 테스트:', username);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      console.log('로그인 응답:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('로그인 성공:', data);
        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('로그인 실패:', errorData);
        return null;
      }
    } catch (error) {
      console.error('로그인 테스트 실패:', error);
      return null;
    }
  },

  // 인증 후 stores API 상세 테스트
  testStoresWithAuth: async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('=== Stores API 상세 테스트 ===');
      console.log('토큰:', token ? '있음' : '없음');
      
      if (!token) {
        console.log('토큰이 없습니다. 먼저 로그인해주세요.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/stores`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('응답 상태:', response.status, response.statusText);
      console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('성공 - Stores 데이터:', data);
      } else {
        const errorText = await response.text();
        console.log('실패 - 오류 내용:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.log('파싱된 오류:', errorJson);
        } catch (e) {
          console.log('JSON 파싱 실패, 원본 텍스트:', errorText);
        }
      }
    } catch (error) {
      console.error('Stores API 테스트 실패:', error);
    }
  },

  // Tables API 테스트 (올바른 엔드포인트)
  testTablesWithAuth: async (storeId: string = '1') => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('=== Tables API 상세 테스트 ===');
      console.log('토큰:', token ? '있음' : '없음');
      console.log('storeId:', storeId);
      
      if (!token) {
        console.log('토큰이 없습니다. 먼저 로그인해주세요.');
        return;
      }

      // 올바른 엔드포인트 사용: /stores/:storeId/tables
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}/tables`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('응답 상태:', response.status, response.statusText);
      console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('성공 - Tables 데이터:', data);
      } else {
        const errorText = await response.text();
        console.log('실패 - 오류 내용:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.log('파싱된 오류:', errorJson);
        } catch (e) {
          console.log('JSON 파싱 실패, 원본 텍스트:', errorText);
        }
      }
    } catch (error) {
      console.error('Tables API 테스트 실패:', error);
    }
  },

  // 현재 인증 상태 확인
  checkAuthStatus: () => {
    console.log('=== 인증 상태 확인 ===');
    console.log('authToken:', localStorage.getItem('authToken') ? '있음' : '없음');
    console.log('userInfo:', localStorage.getItem('userInfo'));
    console.log('userStores:', localStorage.getItem('userStores'));
    
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      console.log('파싱된 사용자 정보:', JSON.parse(userInfo));
    }
    
    const userStores = localStorage.getItem('userStores');
    if (userStores) {
      console.log('파싱된 스토어 정보:', JSON.parse(userStores));
    }
  }
}; 