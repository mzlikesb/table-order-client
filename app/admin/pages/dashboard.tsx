import { useState, useEffect } from 'react';
import { ShoppingCart, Phone, Utensils, Table, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { orderApi, callApi, menuApi, tableApi } from '../../lib/api';
import { initSocket, joinStaffRoom, onOrderUpdate, onCallUpdate, onMenuUpdate, onTableUpdate, offOrderUpdate, offCallUpdate, offMenuUpdate, offTableUpdate } from '../../lib/socket';
import type { Order, Call, MenuItem, Table as TableType } from '../../types/api';
import AdminLayout from '../components/adminLayout';
import ProtectedRoute from '../components/ProtectedRoute';

function AdminDashboardContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

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

    // 실시간 업데이트 리스너 등록
    const handleOrderUpdate = (data: any) => {
      console.log('주문 업데이트 수신:', data);
      loadDashboardData();
    };

    const handleCallUpdate = (data: any) => {
      console.log('호출 업데이트 수신:', data);
      loadDashboardData();
    };

    const handleMenuUpdate = (data: any) => {
      console.log('메뉴 업데이트 수신:', data);
      loadDashboardData();
    };

    const handleTableUpdate = (data: any) => {
      console.log('테이블 업데이트 수신:', data);
      loadDashboardData();
    };

    onOrderUpdate(handleOrderUpdate);
    onCallUpdate(handleCallUpdate);
    onMenuUpdate(handleMenuUpdate);
    onTableUpdate(handleTableUpdate);

    // 초기 데이터 로드
    loadDashboardData();

    // 폴링 백업 (Socket.IO 연결 실패 시)
    const interval = setInterval(loadDashboardData, 30000);

    // 클린업
    return () => {
      clearInterval(interval);
      offOrderUpdate(handleOrderUpdate);
      offCallUpdate(handleCallUpdate);
      offMenuUpdate(handleMenuUpdate);
      offTableUpdate(handleTableUpdate);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const [ordersRes, callsRes, menusRes, tablesRes] = await Promise.allSettled([
        orderApi.getAdminOrders(),
        callApi.getAdminCalls(),
        menuApi.getAdminMenus(),
        tableApi.getTables()
      ]);

      // 주문 데이터 처리
      if (ordersRes.status === 'fulfilled' && ordersRes.value.success) {
        setOrders(ordersRes.value.data || []);
      } else {
        console.warn('주문 데이터 로드 실패:', ordersRes.status === 'rejected' ? ordersRes.reason : ordersRes.value?.error);
      }

      // 호출 데이터 처리
      if (callsRes.status === 'fulfilled' && callsRes.value.success) {
        setCalls(callsRes.value.data || []);
      } else {
        console.warn('호출 데이터 로드 실패:', callsRes.status === 'rejected' ? callsRes.reason : callsRes.value?.error);
      }

      // 메뉴 데이터 처리
      if (menusRes.status === 'fulfilled' && menusRes.value.success) {
        setMenus(menusRes.value.data || []);
      } else {
        console.warn('메뉴 데이터 로드 실패:', menusRes.status === 'rejected' ? menusRes.reason : menusRes.value?.error);
      }

      // 테이블 데이터 처리
      if (tablesRes.status === 'fulfilled' && tablesRes.value.success) {
        setTables(tablesRes.value.data || []);
      } else {
        console.warn('테이블 데이터 로드 실패:', tablesRes.status === 'rejected' ? tablesRes.reason : tablesRes.value?.error);
      }

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      setError('데이터를 불러오는데 실패했습니다. API 서버 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const pendingCalls = calls.filter(call => call.status === 'pending');
  const availableMenus = menus.filter(menu => menu.isAvailable !== false);
  const soldOutMenus = menus.filter(menu => menu.isAvailable === false);

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">관리자 대시보드</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">현재 매장 상태를 한눈에 확인하세요</p>
        
        {/* 실시간 상태 표시 */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {socketConnected ? '실시간 연결됨' : '실시간 연결 끊김'}
            </span>
          </div>
          {pendingCalls.length > 0 && (
            <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
              <Phone className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                대기 호출: {pendingCalls.length}개
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

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="대기 주문"
          value={pendingOrders.length}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard
          title="준비 중 주문"
          value={preparingOrders.length}
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <StatCard
          title="대기 호출"
          value={pendingCalls.length}
          icon={Phone}
          color="bg-red-500"
        />
        <StatCard
          title="총 주문"
          value={orders.length}
          icon={ShoppingCart}
          color="bg-green-500"
        />
      </div>

      {/* 메뉴 및 테이블 상태 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 메뉴 상태 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">메뉴 상태</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">판매 가능</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{availableMenus.length}개</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">품절</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{soldOutMenus.length}개</span>
            </div>
          </div>
        </div>

        {/* 테이블 상태 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">테이블 상태</h2>
          <div className="space-y-4">
            {['available', 'occupied', 'reserved', 'maintenance'].map((status) => {
              const count = tables.filter(table => table.status === status).length;
              const statusLabels = {
                available: '사용 가능',
                occupied: '사용 중',
                reserved: '예약됨',
                maintenance: '점검 중'
              };
              const statusColors = {
                available: 'text-green-500',
                occupied: 'text-blue-500',
                reserved: 'text-yellow-500',
                maintenance: 'text-red-500'
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Table className={`w-5 h-5 mr-2 ${statusColors[status as keyof typeof statusColors]}`} />
                    <span className="text-gray-700 dark:text-gray-300">{statusLabels[status as keyof typeof statusLabels]}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{count}개</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">최근 활동</h2>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">주문 내역이 없습니다.</p>
            </div>
          ) : (
            orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    테이블 {order.tableId} - ₩{order.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status === 'pending' ? '대기' :
                   order.status === 'preparing' ? '준비중' :
                   order.status === 'completed' ? '완료' : '취소'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
} 