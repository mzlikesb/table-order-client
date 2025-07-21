export class TableConfig {
    private static instance: TableConfig
    private tableNumber: string | null = null
    private deviceId: string
    
    private constructor() {
      this.deviceId = this.getOrCreateDeviceId()
    }
    
    static getInstance(): TableConfig {
      if (!this.instance) {
        this.instance = new TableConfig()
      }
      return this.instance
    }
    
    private getOrCreateDeviceId(): string {
      let deviceId = localStorage.getItem('device_id')
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('device_id', deviceId)
      }
      return deviceId
    }
    
    getTableNumber(): string {
      if (this.tableNumber) return this.tableNumber
            
      const storedTable = localStorage.getItem('table_number')
      if (storedTable) {
        this.tableNumber = storedTable
        return this.tableNumber
      }
      
      // 3. 기본값
      return 'A1'
    }
    
    setTableNumber(tableNumber: string): void {
      if (!this.isValidTableNumber(tableNumber)) {
        throw new Error('유효하지 않은 테이블 번호입니다.')
      }
      
      this.tableNumber = tableNumber.toUpperCase().trim()
      localStorage.setItem('table_number', this.tableNumber)
      localStorage.setItem('table_last_updated', new Date().toISOString())
    }
    
    private isValidTableNumber(tableNumber: string): boolean {
      // 영문자, 숫자, 하이픈만 허용 (예: A1, B-2, VIP1 등)
      const pattern = /^[A-Za-z0-9\-]{1,10}$/
      return pattern.test(tableNumber.trim())
    }
    
    getDeviceId(): string {
      return this.deviceId
    }
  }
  