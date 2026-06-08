// src/types/models.ts

// --- Core Models từ Backend ---
export interface User {
  id: number | null
  email: string
  fullName: string
  phoneNumber?: string
  role: 'ADMIN' | 'CUSTOMER'
  balance: number | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Scooter {
  id: number | string
  name: string
  batteryLevel: number
  cycleCount?: number
  stateOfHealth?: number
  temperature?: number | string
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | string
  currentLat: number | string | null
  currentLng: number | string | null
  createdAt?: string
  updatedAt?: string
}

export interface Rental {
  id: number | string
  userId: number | string
  userName?: string
  scooterId: number | string
  startTime: string
  endTime?: string | null
  totalPrice?: number
  status: 'ACTIVE' | 'COMPLETED' | string
  startLat?: number | null
  startLng?: number | null
  endLat?: number | null
  endLng?: number | null
}

// --- Các kiểu dữ liệu dùng chung cho Map / Analytics ---
export interface LatLngPos {
  lat: number
  lng: number
}

export interface Station {
  lat: number | string
  lng: number | string
  name?: string
}

// --- DTOs cho các feature mới ---
export interface TransactionRecord {
  id: number
  userId: number
  userName: string
  amount: number
  type: string
  description: string
  createdAt: string
}

export interface FeedbackRequest {
  rentalId: number
  rating: number
  comment?: string
}

export interface FeedbackResponse {
  id: number
  rentalId: number
  userId: number
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export interface DashboardStats {
  totalRevenue: number
  totalCompletedRentals: number
  activeRentals: number
  availableScooters: number
  maintenanceScooters: number
  totalMaintenanceCost: number
}