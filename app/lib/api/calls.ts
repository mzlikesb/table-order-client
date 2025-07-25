import type { Call, CreateCallRequest, CallStatus, CallType, ApiResponse } from '../../types/api';

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
  createCall: async (callData: CreateCallRequest): Promise<ApiResponse<Call>> => {
    try {
      const serverCallData = {
        store_id: callData.storeId,
        table_id: callData.tableId,
        call_type: callData.type,
        message: null // 백엔드에서 message는 선택사항
      };
      
      const response = await fetch(`${API_BASE_URL}/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverCallData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '호출 생성에 실패했습니다.' };
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '호출 생성에 실패했습니다.' };
    }
  },
  getAdminCalls: async (): Promise<ApiResponse<Call[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/calls`);
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '호출 목록을 불러오는데 실패했습니다.' };
      }
      const data = await response.json();
      
      // 백엔드 데이터를 프론트엔드 타입에 맞게 변환
      const transformedCalls = data.map((call: any) => ({
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
      
      const response = await fetch(`${API_BASE_URL}/calls/${callId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '호출 상태 변경에 실패했습니다.' };
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: '호출 상태 변경에 실패했습니다.' };
    }
  },
  getTableCalls: async (tableId: string): Promise<ApiResponse<Call[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/table/${tableId}`);
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '테이블별 호출을 불러오는데 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: data.map(transformServerCall) };
    } catch (error) {
      return { success: false, error: '테이블별 호출을 불러오는데 실패했습니다.' };
    }
  },
  completeCall: async (callId: string): Promise<ApiResponse<Call>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/calls/${callId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '호출 완료 처리에 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerCall(data) };
    } catch (error) {
      return { success: false, error: '호출 완료 처리에 실패했습니다.' };
    }
  }
}; 