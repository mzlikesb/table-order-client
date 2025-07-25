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
      const tableIdNumber = parseInt(callData.tableId);
      const isTableIdNumber = !isNaN(tableIdNumber);
      const serverCallData = {
        table_id: isTableIdNumber ? tableIdNumber : 1,
        request_content: callData.type
      };
      const response = await fetch(`${API_BASE_URL}/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverCallData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || errorData.message || '호출 생성에 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerCall(data) };
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
      return { success: true, data: data.map(transformServerCall) };
    } catch (error) {
      return { success: false, error: '호출 목록을 불러오는데 실패했습니다.' };
    }
  },
  updateCallStatus: async (callId: string, status: CallStatus): Promise<ApiResponse<Call>> => {
    try {
      const transformToServerStatus = (clientStatus: CallStatus): string => {
        switch (clientStatus) {
          case 'pending': return 'waiting';
          case 'completed': return 'completed';
          default: return 'waiting';
        }
      };
      const serverStatus = transformToServerStatus(status);
      const response = await fetch(`${API_BASE_URL}/calls/${callId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: serverStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '호출 상태 변경에 실패했습니다.' };
      }
      const data = await response.json();
      return { success: true, data: transformServerCall(data) };
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