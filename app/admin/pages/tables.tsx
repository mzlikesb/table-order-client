import { useState, useEffect } from 'react';
import { Table, Users, Filter, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { tableApi } from '../../lib/api';
import type { Table as TableType, TableStatus } from '../../types/api';
import AdminNav from '../components/adminNav';

export default function AdminTables() {
  const [tables, setTables] = useState<TableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'all'>('all');

  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 15000); // 15초마다 새로고침
    return () => clearInterval(interval);
  }, []);

  const loadTables = async () => {
    try {
      const response = await tableApi.getTables();
      if (response.success) {
        setTables(response.data || []);
      }
    } catch (error) {
      console.error('테이블 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (tableId: string, newStatus: TableStatus) => {
    try {
      const response = await tableApi.updateTableStatus(tableId, newStatus);
      if (response.success) {
        loadTables(); // 목록 새로고침
      } else {
        alert('테이블 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('테이블 상태 변경 실패:', error);
      alert('테이블 상태 변경에 실패했습니다.');
    }
  };

  const filteredTables = tables.filter(table => {
    return statusFilter === 'all' || table.status === statusFilter;
  });

  const getStatusIcon = (status: TableStatus) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'occupied': return <Users className="w-5 h-5 text-blue-500" />;
      case 'reserved': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'maintenance': return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'occupied': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'maintenance': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const getStatusText = (status: TableStatus) => {
    switch (status) {
      case 'available': return '사용 가능';
      case 'occupied': return '사용 중';
      case 'reserved': return '예약됨';
      case 'maintenance': return '점검 중';
    }
  };

  const getStatusCount = (status: TableStatus) => {
    return tables.filter(table => table.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">테이블 목록을 불러오는 중...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">테이블 관리</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">테이블 상태를 관리하고 모니터링하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">사용 가능</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getStatusCount('available')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">사용 중</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getStatusCount('occupied')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">예약됨</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getStatusCount('reserved')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">점검 중</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getStatusCount('maintenance')}</p>
              </div>
            </div>
          </div>
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
              onChange={(e) => setStatusFilter(e.target.value as TableStatus | 'all')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 상태</option>
              <option value="available">사용 가능</option>
              <option value="occupied">사용 중</option>
              <option value="reserved">예약됨</option>
              <option value="maintenance">점검 중</option>
            </select>
          </div>
        </div>

        {/* 테이블 목록 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              테이블 목록 ({filteredTables.length}개)
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredTables.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">테이블이 없습니다.</p>
              </div>
            ) : (
              filteredTables.map((table) => (
                <div key={table.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(table.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          테이블 {table.number}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {table.capacity}인용
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* 상태 표시 */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                        {getStatusText(table.status)}
                      </span>
                    </div>

                    {/* 현재 주문 수 */}
                    {table.currentOrderCount !== undefined && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        현재 주문: {table.currentOrderCount}개
                      </div>
                    )}

                    {/* 상태 변경 버튼들 */}
                    <div className="flex flex-wrap gap-2">
                      {table.status !== 'available' && (
                        <button
                          onClick={() => handleStatusUpdate(table.id, 'available')}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                        >
                          사용 가능
                        </button>
                      )}
                      
                      {table.status !== 'occupied' && (
                        <button
                          onClick={() => handleStatusUpdate(table.id, 'occupied')}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          사용 중
                        </button>
                      )}
                      
                      {table.status !== 'reserved' && (
                        <button
                          onClick={() => handleStatusUpdate(table.id, 'reserved')}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
                        >
                          예약
                        </button>
                      )}
                      
                      {table.status !== 'maintenance' && (
                        <button
                          onClick={() => handleStatusUpdate(table.id, 'maintenance')}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                        >
                          점검
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 