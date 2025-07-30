// 공통 헤더 설정
export const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // 인증 토큰 추가
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 멀티테넌트 지원을 위한 헤더
  const store = localStorage.getItem('admin_store');
  if (store) {
    try {
      const storeData = JSON.parse(store);
      if (storeData.id) {
        headers['X-Store-ID'] = storeData.id;
      }
    } catch (error) {
      console.error('스토어 정보 파싱 오류:', error);
    }
  }
  
  return headers;
};

// 고객 모드용 공개 헤더 (인증 없이)
export const getPublicHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // 공개 API는 인증이나 스토어 헤더 없이 기본 헤더만 사용
  // store_id는 URL 쿼리 파라미터로 전달됨
  return headers;
};

// API 응답 처리 유틸리티
export const handleApiResponse = async (response: Response, errorMessage: string) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData: JSON.stringify(errorData, null, 2)
      });
      return { 
        success: false, 
        error: errorData.error || errorData.message || `${errorMessage} (${response.status})` 
      };
    } catch (parseError) {
      console.error('API Error (could not parse JSON):', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        parseError
      });
      return { 
        success: false, 
        error: `${errorMessage} (${response.status}: ${response.statusText})` 
      };
    }
  }
  
  try {
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('응답 파싱 오류:', error);
    return { success: false, error: '응답 데이터를 처리하는데 실패했습니다.' };
  }
};

// API 요청 유틸리티 (인증 포함)
export const apiRequest = async (
  url: string, 
  options: RequestInit = {}, 
  errorMessage: string
) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });
    
    return await handleApiResponse(response, errorMessage);
  } catch (error) {
    console.error('API 요청 오류:', error);
    return { success: false, error: errorMessage };
  }
};

// 고객 모드용 공개 API 요청 유틸리티 (인증 없이)
export const publicApiRequest = async (
  url: string, 
  options: RequestInit = {}, 
  errorMessage: string
) => {
  try {
    // url이 이미 전체 URL인지 확인하고 적절히 처리
    let fullUrl: string;
    if (url.startsWith('http')) {
      // 이미 전체 URL인 경우
      fullUrl = url;
    } else {
      // 경로만 전달된 경우 API_BASE_URL 추가
      const API_BASE_URL = 'http://dongyo.synology.me:14000/api';
      fullUrl = `${API_BASE_URL}${url}`;
    }
    
    console.log('공개 API 요청 URL:', fullUrl);
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...getPublicHeaders(),
        ...options.headers,
      },
    });
    
    return await handleApiResponse(response, errorMessage);
  } catch (error) {
    console.error('공개 API 요청 오류:', error);
    return { success: false, error: errorMessage };
  }
}; 