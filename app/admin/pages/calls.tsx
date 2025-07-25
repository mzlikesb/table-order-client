import { useState, useEffect } from 'react';
import { Phone, CheckCircle, Clock, Droplets, Utensils, Users, HelpCircle, Filter, AlertCircle } from 'lucide-react';
import { callApi } from '../../lib/api';
import { initSocket, joinStaffRoom, onCallUpdate, offCallUpdate } from '../../lib/socket';
import type { Call, CallStatus, CallType, Store as StoreType } from '../../types/api';
import AdminLayout from '../components/adminLayout';
import ProtectedRoute from '../components/ProtectedRoute';

function AdminCallsContent() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CallType | 'all'>('all');
  const [tableFilter, setTableFilter] = useState<string>('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [store, setStore] = useState<StoreType | null>(null);

  // 스토어 정보 가져오기 함수
  const getStoreInfo = () => {
    const savedStore = localStorage.getItem('admin_store');
    if (savedStore) {
      try {
        return JSON.parse(savedStore);
      } catch {
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    // 스토어 정보 초기화
    const storeInfo = getStoreInfo();
    setStore(storeInfo);

    // Socket.IO 초기화 및 직원용 룸 참가
    const socket = initSocket();
    joinStaffRoom();
    setSocketConnected(socket.connected);

    // Socket.IO 연결 상태 모니터링
    const handleConnect = () => {
      console.log('Socket.IO 연결됨');
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.log('Socket.IO 연결 해제');
      setSocketConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // 실시간 호출 업데이트 리스너
    const handleCallUpdate = (data: any) => {
      console.log('호출 업데이트 수신:', data);
      loadCalls();
    };

    onCallUpdate(handleCallUpdate);

    // 초기 데이터 로드
    loadCalls();

    // 폴링 백업 (Socket.IO 연결 실패 시)
    const interval = setInterval(loadCalls, 10000);

    // 클린업
    return () => {
      clearInterval(interval);
      offCallUpdate(handleCallUpdate);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  // 스토어 변경 시 데이터 다시 로드
  useEffect(() => {
    if (store) {
      loadCalls();
    }
  }, [store?.id]);

  const loadCalls = async () => {
    try {
      setError(null);
      const response = await callApi.getAdminCalls(store?.id);
      if (response.success) {
        setCalls(response.data || []);
      } else {
        console.warn('호출 목록 로드 실패:', response.error);
        setError('호출 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('호출 목록 로드 실패:', error);
      setError('호출 목록을 불러오는데 실패했습니다. API 서버 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (callId: string, newStatus: CallStatus) => {
    try {
      const response = await callApi.updateCallStatus(callId, newStatus);
      if (response.success) {
        // 즉시 목록 새로고침
        await loadCalls();
      } else {
        alert('호출 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('호출 상태 변경 실패:', error);
      alert('호출 상태 변경에 실패했습니다.');
    }
  };

  const filteredCalls = calls.filter(call => {
    const statusMatch = statusFilter === 'all' || call.status === statusFilter;
    const typeMatch = typeFilter === 'all' || call.type === typeFilter;
    const tableMatch = !tableFilter || call.tableId.includes(tableFilter);
    return statusMatch && typeMatch && tableMatch;
  });

  const pendingCallsCount = calls.filter(call => call.status === 'pending').length;

  const getCallTypeIcon = (type: CallType) => {
    switch (type) {
      case 'service': return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'bill': return <Utensils className="w-4 h-4 text-green-500" />;
      case 'help': return <Users className="w-4 h-4 text-purple-500" />;
      case 'custom': return <HelpCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getCallTypeText = (type: CallType) => {
    switch (type) {
      case 'service': return '서비스';
      case 'bill': return '계산';
      case 'help': return '도움';
      case 'custom': return '기타';
    }
  };

  const getStatusIcon = (status: CallStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: CallStatus) => {
    switch (status) {
      case 'pending': return '대기';
      case 'completed': return '완료';
      default: return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">호출 목록을 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">호출 관리</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">고객 호출을 관리하고 상태를 업데이트하세요</p>
        
        {/* 실시간 상태 표시 */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {socketConnected ? '실시간 연결됨' : '실시간 연결 끊김'}
            </span>
          </div>
          {pendingCallsCount > 0 && (
            <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
              <Phone className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                대기 호출: {pendingCallsCount}개
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">필터:</span>
          </div>
          
          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CallStatus | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 상태</option>
            <option value="pending">대기</option>
            <option value="completed">완료</option>
          </select>

          {/* 호출 유형 필터 */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as CallType | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 유형</option>
            <option value="service">서비스</option>
            <option value="bill">계산</option>
            <option value="help">도움</option>
            <option value="custom">기타</option>
          </select>

          {/* 테이블 필터 */}
          <input
            type="text"
            placeholder="테이블 번호로 검색..."
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 호출 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            호출 목록 ({filteredCalls.length}개)
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredCalls.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">호출이 없습니다.</p>
            </div>
          ) : (
            filteredCalls.map((call) => (
              <div key={call.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getCallTypeIcon(call.type)}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getCallTypeText(call.type)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(call.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                        {getStatusText(call.status)} ({call.status})
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        테이블 {call.tableNumber || call.tableId}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(call.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* 호출 메시지 */}
                {call.message && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">메시지:</span> {call.message}
                    </p>
                  </div>
                )}

                {/* 상태 변경 버튼 */}
                {call.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(call.id, 'completed')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      완료 처리
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminCalls() {
  return (
    <ProtectedRoute>
      <AdminCallsContent />
    </ProtectedRoute>
  );
} 