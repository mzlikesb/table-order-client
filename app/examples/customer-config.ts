// 고객용 설정 예제
// 테이블 고유번호만으로 완전한 정보를 조회하는 방법
// 백엔드 공개 API를 사용하여 테이블과 스토어 정보를 자동으로 설정
// 주의: 백엔드 API 구현이 필요합니다.

import { tableApi, storeApi } from '../lib/api';

// 고객용 설정 인터페이스
interface CustomerConfig {
  tableId: string;
  storeId: string | null;
  tableInfo: any | null;
}

// 고객용 설정 초기화
const customerConfig: CustomerConfig = {
  tableId: '5', // 이 고객용 디바이스의 테이블 고유번호
  storeId: null,  // 아직 모름
  tableInfo: null  // 아직 모름
};

// 1. 테이블 정보로 스토어 정보도 자동 획득
export const setupCustomer = async (tableId: string) => {
  try {
    console.log('고객용 설정 시작 - tableId:', tableId);
    
    // 1. 테이블 정보 조회: GET /api/tables/public/{tableId}
    const tableResult = await tableApi.getPublicTable(tableId);
    
    if (!tableResult.success || !tableResult.data) {
      console.error('테이블 정보 조회 실패:', tableResult.error);
      
      // 백엔드 API 미구현 시 더 명확한 메시지
      if (tableResult.error?.includes('404') || tableResult.error?.includes('Not Found')) {
        return {
          success: false,
          error: '백엔드 API가 아직 구현되지 않았습니다. 관리자에게 문의하세요.'
        };
      }
      
      return {
        success: false,
        error: tableResult.error || '테이블 정보를 찾을 수 없습니다.'
      };
    }

    const tableInfo = tableResult.data;
    console.log('테이블 정보 조회 성공:', tableInfo);

    // 2. 스토어 정보 조회: GET /api/stores/public/{storeId}
    const storeResult = await storeApi.getPublicStore(tableInfo.storeId);
    
    if (!storeResult.success || !storeResult.data) {
      console.error('스토어 정보 조회 실패:', storeResult.error);
      return {
        success: false,
        error: '스토어 정보를 찾을 수 없습니다.'
      };
    }
    
    const storeData = storeResult.data;

    console.log('스토어 정보 조회 성공:', storeData);
    
    // 고객용 설정 업데이트
    customerConfig.storeId = tableInfo.storeId;
    customerConfig.tableInfo = tableInfo;
    
    console.log('고객용 설정 완료:', {
      tableId: tableInfo.id,
      tableNumber: tableInfo.number,
      tableName: tableInfo.name,
      storeId: tableInfo.storeId,
      storeName: storeData.name,
      capacity: tableInfo.capacity,
      status: tableInfo.status
    });
    
    // 로컬 스토리지에 정보 저장
    localStorage.setItem('table_number', tableInfo.number);
    localStorage.setItem('admin_store', JSON.stringify(storeData));
    
    return {
      success: true,
      tableInfo: tableInfo,
      storeInfo: storeData,
      message: '고객용 설정이 완료되었습니다.'
    };
  } catch (error) {
    console.error('고객용 설정 중 오류 발생:', error);
    return {
      success: false,
      error: '고객용 설정 중 오류가 발생했습니다.'
    };
  }
};

// 2. 스토어별 테이블 목록 조회 (관리자용) - 백엔드 API 구현 필요
export const getStoreTables = async (storeId: string) => {
  try {
    console.log('스토어 테이블 목록 조회 - storeId:', storeId);
    
    const result = await tableApi.getPublicTablesByStore(storeId);
    
    if (result.success) {
      console.log('스토어 테이블 목록 조회 성공:', result.data);
      return {
        success: true,
        tables: result.data,
        message: `${result.data?.length || 0}개의 테이블을 찾았습니다.`
      };
    } else {
      console.error('스토어 테이블 목록 조회 실패:', result.error);
      return {
        success: false,
        error: result.error || '백엔드 API가 미구현되어 테이블 목록을 불러올 수 없습니다.'
      };
    }
  } catch (error) {
    console.error('스토어 테이블 목록 조회 중 오류 발생:', error);
    return {
      success: false,
      error: '테이블 목록 조회 중 오류가 발생했습니다.'
    };
  }
};

// 3. 개별 테이블 정보 조회 - 백엔드 API 구현 필요
export const getTableInfo = async (tableId: string) => {
  try {
    console.log('개별 테이블 정보 조회 - tableId:', tableId);
    
    const result = await tableApi.getPublicTable(tableId);
    
    if (result.success && result.data) {
      console.log('개별 테이블 정보 조회 성공:', result.data);
      return {
        success: true,
        tableInfo: result.data,
        message: '테이블 정보를 성공적으로 조회했습니다.'
      };
    } else {
      console.error('개별 테이블 정보 조회 실패:', result.error);
      return {
        success: false,
        error: result.error || '백엔드 API가 미구현되어 테이블 정보를 찾을 수 없습니다.'
      };
    }
  } catch (error) {
    console.error('개별 테이블 정보 조회 중 오류 발생:', error);
    return {
      success: false,
      error: '테이블 정보 조회 중 오류가 발생했습니다.'
    };
  }
};

// 사용 예시
export const exampleUsage = async () => {
  // 고객용 설정
  const setupResult = await setupCustomer('5');
  if (setupResult.success && setupResult.tableInfo) {
    console.log('고객용 설정 성공!');
    
    // 스토어별 테이블 목록 조회
    const tablesResult = await getStoreTables(setupResult.tableInfo.storeId);
    if (tablesResult.success) {
      console.log('스토어의 모든 테이블:', tablesResult.tables);
    }
    
    // 개별 테이블 정보 조회
    const tableInfoResult = await getTableInfo('5');
    if (tableInfoResult.success) {
      console.log('테이블 상세 정보:', tableInfoResult.tableInfo);
    }
  } else {
    console.error('고객용 설정 실패:', setupResult.error);
  }
};

// API 사용 예시 (백엔드 API 구현 필요)
/*
// 고객용 디바이스에서 활용 방법
// 백엔드 공개 API를 사용하여 테이블과 스토어 정보를 자동으로 설정
// 주의: 백엔드 API 구현이 필요합니다.

const customerConfig = {
  tableId: 5,  // 이 고객용 디바이스의 테이블 고유번호
  storeId: null,  // 아직 모름
  tableInfo: null  // 아직 모름
};

// 1. 테이블 정보로 스토어 정보도 자동 획득 (백엔드 API 구현 필요)
fetch(`http://dongyo.synology.me:14000/api/tables/public/${customerConfig.tableId}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('백엔드 API가 아직 구현되지 않았습니다.');
    }
    return response.json();
  })
  .then(tableInfo => {
    customerConfig.storeId = tableInfo.store_id;
    customerConfig.tableInfo = tableInfo;
    
    // 2. 스토어 정보 조회
    return fetch(`http://dongyo.synology.me:14000/api/stores/public/${tableInfo.store_id}`);
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('스토어 정보를 찾을 수 없습니다.');
    }
    return response.json();
  })
  .then(storeInfo => {
    console.log('고객용 설정 완료:', {
      tableId: customerConfig.tableInfo.id,
      tableNumber: customerConfig.tableInfo.table_number,
      tableName: customerConfig.tableInfo.name,
      storeId: customerConfig.tableInfo.store_id,
      storeName: storeInfo.name,
      capacity: customerConfig.tableInfo.capacity
    });
  })
  .catch(error => {
    console.error('고객용 설정 실패:', error.message);
  });
*/ 