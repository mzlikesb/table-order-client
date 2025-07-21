export interface Table {
    id: string
    tableNumber: string 
    status: 'available' | 'occupied' | 'reserved'
    capacity: number
    currentOrders?: number
  }
  
  export interface TableConfig {
    tableNumber: string
    storeId: string
    deviceId: string
    lastUpdated: string
  }
  