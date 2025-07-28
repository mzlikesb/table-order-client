// 공통 헤더 설정
export const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
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

// API 응답 처리 유틸리티
export const handleApiResponse = async (response: Response, errorMessage: string) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: '서버 오류' }));
    return { 
      success: false, 
      error: errorData.error || `${errorMessage} (${response.status})` 
    };
  }
  
  try {
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('응답 파싱 오류:', error);
    return { success: false, error: '응답 데이터를 처리하는데 실패했습니다.' };
  }
};

// API 요청 유틸리티
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