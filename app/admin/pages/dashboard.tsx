import { useState, useEffect } from 'react';
import { ShoppingCart, Phone, Utensils, Table, TrendingUp, Clock, CheckCircle, AlertCircle, Store } from 'lucide-react';
import { orderApi, callApi, menuApi, tableApi } from '../../lib/api';
import { initSocket, joinStaffRoom, onOrderUpdate, onCallUpdate, onMenuUpdate, onTableUpdate, offOrderUpdate, offCallUpdate, offMenuUpdate, offTableUpdate } from '../../lib/socket';
import type { Order, Call, MenuItem, Table as TableType, Store as StoreType } from '../../types/api';
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

  // 스토어 변경 시 데이터 다시 로드
  useEffect(() => {
    if (store) {
      loadDashboardData();
    }
  }, [store?.id]);

  const loadDashboardData = async () => {
    try {
      setError(null);
      
      // 스토어가 선택되지 않은 경우 기본 데이터만 로드
      if (!store) {
        setOrders([]);
        setCalls([]);
        setMenus([]);
        setTables([]);
        setLoading(false);
        return;
      }

      const [ordersRes, callsRes, menusRes, tablesRes] = await Promise.allSettled([
        orderApi.getAdminOrders(),
        callApi.getAdminCalls(),
        menuApi.getAdminMenus(),
        tableApi.getTables(store.id)
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
  const availableMenus = menus.filter(menu => menu.isAvailable);
  const soldOutMenus = menus.filter(menu => !menu.isAvailable);

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} text-white`}>
          <Icon className="w-6 h-6" />
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
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">관리자 대시보드</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">현재 매장 상태를 한눈에 확인하세요</p>
        </div>
        
        {/* 스토어 정보 표시 */}
        {store && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <Store className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">{store.name}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">코드: {store.code}</p>
                {store.address && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">{store.address}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
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

      {/* 스토어 미선택 안내 */}
      {!store && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
            <p className="text-yellow-700 dark:text-yellow-400">
              상단 헤더에서 스토어를 선택하면 해당 스토어의 데이터를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      )}

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
              const getStatusInfo = (status: string) => {
                switch (status) {
                  case 'available': return { name: '사용 가능', color: 'text-green-500', icon: CheckCircle };
                  case 'occupied': return { name: '사용 중', color: 'text-blue-500', icon: Clock };
                  case 'reserved': return { name: '예약됨', color: 'text-yellow-500', icon: AlertCircle };
                  case 'maintenance': return { name: '점검 중', color: 'text-red-500', icon: AlertCircle };
                  default: return { name: '알 수 없음', color: 'text-gray-500', icon: AlertCircle };
                }
              };
              const statusInfo = getStatusInfo(status);
              const Icon = statusInfo.icon;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className={`w-5 h-5 ${statusInfo.color} mr-2`} />
                    <span className="text-gray-700 dark:text-gray-300">{statusInfo.name}</span>
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