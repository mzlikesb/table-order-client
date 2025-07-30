import type { Call, CreateCallRequest, CallStatus, CallType, ApiResponse } from '../../types/api';
import { apiRequest, publicApiRequest } from './common';

const API_BASE_URL = 'http://dongyo.synology.me:14000/api';

export const transformServerCall = (serverData: any): Call => {
  const transformStatus = (serverStatus: string): CallStatus => {
    switch (serverStatus) {
      case 'waiting': return 'pending';
      case 'processing': return 'pending';
      case 'completed': return 'completed';
      case 'cancelled': return 'completed';
      default: return 'pending';
    }
  };
  return {
    id: serverData.id,
    tableId: serverData.table_id,
    type: serverData.request_content as CallType,
    status: transformStatus(serverData.status),
    message: serverData.request_content,
    createdAt: serverData.created_at,
    updatedAt: serverData.updated_at || serverData.created_at,
    completedAt: serverData.completed_at
  };
};

export const callApi = {
  // 관리자용 호출 생성 (인증 필요)
  createCall: async (callData: CreateCallRequest): Promise<ApiResponse<Call>> => {
    try {
      const serverCallData = {
        store_id: callData.storeId,
        table_id: callData.tableId,
        call_type: callData.type,
        message: null // 백엔드에서 message는 선택사항
      };
      
      const result = await apiRequest(
        `${API_BASE_URL}/calls`,
        {
          method: 'POST',
          body: JSON.stringify(serverCallData),
        },
        '호출 생성에 실패했습니다.'
      );
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: '호출 생성에 실패했습니다.' };
    }
  },

  // 고객용 호출 생성 (인증 없이)
  createPublicCall: async (callData: CreateCallRequest): Promise<ApiResponse<Call>> => {
    try {
      const serverCallData = {
        store_id: callData.storeId,
        table_id: callData.tableId,
        call_type: callData.type,
        message: null // 백엔드에서 message는 선택사항
      };
      
      const result = await publicApiRequest(
        `/calls/public`,
        {
          method: 'POST',
          body: JSON.stringify(serverCallData),
        },
        '호출 생성에 실패했습니다.'
      );
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: '호출 생성에 실패했습니다.' };
    }
  },

  getAdminCalls: async (storeId?: string): Promise<ApiResponse<Call[]>> => {
    try {
      const url = storeId ? `${API_BASE_URL}/calls/store/${storeId}` : `${API_BASE_URL}/calls`;
      
      const result = await apiRequest(
        url,
        {},
        '호출 목록을 불러오는데 실패했습니다.'
      );
      
      if (result.success) {
        // 백엔드 데이터를 프론트엔드 타입에 맞게 변환
        const transformedCalls = (result.data || []).map((call: any) => ({
          id: call.id,
          tableId: call.table_id || call.tableId,
          tableNumber: call.table_number || call.tableNumber, // 테이블 번호 추가
          type: call.call_type || call.type,
          status: call.status,
          message: call.message,
          createdAt: call.created_at || call.createdAt,
          updatedAt: call.updated_at || call.updatedAt,
          completedAt: call.completed_at || call.completedAt,
        }));
        
        return { success: true, data: transformedCalls };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: '호출 목록을 불러오는데 실패했습니다.' };
    }
  },
  updateCallStatus: async (callId: string, status: CallStatus, respondedBy?: string): Promise<ApiResponse<Call>> => {
    try {
      const body: any = { status: String(status) };
      if (respondedBy) {
        body.responded_by = respondedBy;
      }
      
      const result = await apiRequest(
        `${API_BASE_URL}/calls/${callId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify(body),
        },
        '호출 상태 변경에 실패했습니다.'
      );
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: '호출 상태 변경에 실패했습니다.' };
    }
  },
  getTableCalls: async (tableId: string): Promise<ApiResponse<Call[]>> => {
    try {
      const result = await apiRequest(
        `${API_BASE_URL}/calls/table/${tableId}`,
        {},
        '테이블별 호출을 불러오는데 실패했습니다.'
      );
      
      if (result.success) {
        return { success: true, data: result.data.map(transformServerCall) };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: '테이블별 호출을 불러오는데 실패했습니다.' };
    }
  },
  completeCall: async (callId: string): Promise<ApiResponse<Call>> => {
    try {
      const result = await apiRequest(
        `${API_BASE_URL}/calls/${callId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' }),
        },
        '호출 완료 처리에 실패했습니다.'
      );
      
      if (result.success) {
        return { success: true, data: transformServerCall(result.data) };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: '호출 완료 처리에 실패했습니다.' };
    }
  }
}; 