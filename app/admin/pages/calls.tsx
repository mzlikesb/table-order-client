import { useState, useEffect } from 'react';
import { Phone, CheckCircle, Clock, Droplets, Utensils, Users, HelpCircle, Filter } from 'lucide-react';
import { callApi } from '../../lib/api';
import type { Call, CallStatus, CallType } from '../../types/api';
import AdminNav from '../components/adminNav';

export default function AdminCalls() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CallType | 'all'>('all');
  const [tableFilter, setTableFilter] = useState<string>('');

  useEffect(() => {
    loadCalls();
    const interval = setInterval(loadCalls, 10000); // 10초마다 새로고침
    return () => clearInterval(interval);
  }, []);

  const loadCalls = async () => {
    try {
      const response = await callApi.getAdminCalls();
      if (response.success) {
        setCalls(response.data || []);
      }
    } catch (error) {
      console.error('호출 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (callId: string, newStatus: CallStatus) => {
    try {
      const response = await callApi.updateCallStatus(callId, newStatus);
      if (response.success) {
        loadCalls(); // 목록 새로고침
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

  const getCallTypeIcon = (type: CallType) => {
    switch (type) {
      case 'water': return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'plate': return <Utensils className="w-4 h-4 text-green-500" />;
      case 'staff': return <Users className="w-4 h-4 text-purple-500" />;
      case 'other': return <HelpCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getCallTypeText = (type: CallType) => {
    switch (type) {
      case 'water': return '물';
      case 'plate': return '그릇';
      case 'staff': return '직원 호출';
      case 'other': return '기타';
    }
  };

  const getStatusIcon = (status: CallStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (status: CallStatus) => {
    switch (status) {
      case 'pending': return '대기';
      case 'completed': return '완료';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">호출 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">호출 관리</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">고객 호출을 관리하고 상태를 업데이트하세요</p>
        </div>

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
              <option value="water">물</option>
              <option value="plate">그릇</option>
              <option value="staff">직원 호출</option>
              <option value="other">기타</option>
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
                          {getStatusText(call.status)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          테이블 {call.tableId}
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
      </div>
    </div>
  );
} 