export type UserRole = 'superadmin' | 'branch_admin' | 'seller'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  role: UserRole
  branch_id?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Branch {
  id: string
  name: string
  address: string
  city: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Route {
  id: string
  name: string
  origin: string
  destination: string
  price: number
  departure_date: string
  departure_time: string
  capacity: number
  seats_taken: number
  created_at?: string
  updated_at?: string
}

export type Database = {
  public: {
    Tables: {
      routes: {
        Row: Route
        Insert: Omit<Route, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Route, 'id'>>
      }
    }
  }
}