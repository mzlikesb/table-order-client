import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Eye, Filter, AlertCircle, Bell, Utensils } from 'lucide-react';
import { orderApi } from '../../lib/api/index';
import { initSocket, joinStaffRoom, onOrderUpdate, offOrderUpdate } from '../../lib/socket';
import type { Order, OrderStatus } from '../../types/api';
import KitchenNav from '../components/kitchenNav';

export default function KitchenOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [tableFilter, setTableFilter] = useState<string>('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  useEffect(() => {
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

    // 실시간 주문 업데이트 리스너
    const handleOrderUpdate = (data: any) => {
      console.log('주문 업데이트 수신:', data);
      loadOrders();
      // 새 주문 알림
      if (data.status === 'pending') {
        setNewOrderAlert(true);
        setTimeout(() => setNewOrderAlert(false), 5000);
        // 브라우저 알림
        if (Notification.permission === 'granted') {
          new Notification('새 주문!', {
            body: `테이블 ${data.tableId}에서 새 주문이 들어왔습니다.`,
            icon: '/favicon.ico'
          });
        }
      }
    };

    onOrderUpdate(handleOrderUpdate);

    // 브라우저 알림 권한 요청
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // 초기 데이터 로드
    loadOrders();

    // 폴링 백업 (Socket.IO 연결 실패 시)
    const interval = setInterval(loadOrders, 5000);

    // 클린업
    return () => {
      clearInterval(interval);
      offOrderUpdate(handleOrderUpdate);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const loadOrders = async () => {
    try {
      setError(null);
      const response = await orderApi.getAdminOrders();
      if (response.success) {
        setOrders(response.data || []);
      } else {
        console.warn('주문 목록 로드 실패:', response.error);
        setError('주문 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('주문 목록 로드 실패:', error);
      setError('주문 목록을 불러오는데 실패했습니다. API 서버 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await orderApi.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        await loadOrders();
      } else {
        alert('주문 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('주문 상태 변경 실패:', error);
      alert('주문 상태 변경에 실패했습니다.');
    }
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const tableMatch = !tableFilter || order.tableId.includes(tableFilter);
    return statusMatch && tableMatch;
  });

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'preparing': return <Utensils className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '대기';
      case 'preparing': return '조리중';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <KitchenNav />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">주문 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <KitchenNav />
      
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">주문 관리</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {socketConnected ? '실시간 연결됨' : '실시간 연결 끊김'}
                </span>
              </div>
            </div>
            
            {/* 주문 상태 요약 */}
            <div className="flex items-center space-x-4">
              {pendingOrders.length > 0 && (
                <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    대기: {pendingOrders.length}개
                  </span>
                </div>
              )}
              {preparingOrders.length > 0 && (
                <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                  <Utensils className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    조리중: {preparingOrders.length}개
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 새 주문 알림 */}
      {newOrderAlert && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span className="font-medium">새 주문이 들어왔습니다!</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
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
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 상태</option>
              <option value="pending">대기</option>
              <option value="preparing">조리중</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
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

        {/* 주문 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">주문이 없습니다.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {/* 주문 헤더 */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        테이블 {order.tableId}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ₩{order.totalAmount.toLocaleString()}
                    </span>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* 주문 상세 */}
                <div className="p-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.menuName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            x{item.quantity}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ₩{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 상태 변경 버튼 */}
                  <div className="mt-4 flex space-x-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'preparing')}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          조리 시작
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          취소
                        </button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                        className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        조리 완료
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
  );
} 