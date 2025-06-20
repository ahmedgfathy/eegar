import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mkhwoqsnpyjadhulrdgw.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1raHdvcXNucHlqYWRodWxyZGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyMzA5NjIsImV4cCI6MjA0OTgwNjk2Mn0.5mxiM8sJozMPrzgz33SfYdEAh9cTDu4fKMrIhJMJJMw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your schema
export interface Broker {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  specialization?: string
  experience_years?: number
  commission_rate?: number
  status: string
  created_at: Date
  updated_at: Date
}

export interface Contact {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  source?: string
  status: string
  assigned_broker_id?: number
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface Property {
  id: number
  title: string
  description?: string
  property_type: string
  price: number
  currency: string
  location: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  status: string
  broker_id?: number
  images?: string
  features?: string
  created_at: Date
  updated_at: Date
}

export interface Client {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  client_type: string
  preferences?: string
  budget_min?: number
  budget_max?: number
  status: string
  created_at: Date
  updated_at: Date
}

export interface Transaction {
  id: number
  property_id: number
  buyer_id?: number
  seller_id?: number
  broker_id?: number
  transaction_type: string
  amount: number
  currency: string
  commission?: number
  status: string
  date_initiated: Date
  date_completed?: Date
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface Lead {
  id: number
  name: string
  email: string
  phone?: string
  property_interest?: string
  budget_range?: string
  source?: string
  status: string
  assigned_broker_id?: number
  notes?: string
  created_at: Date
  updated_at: Date
}
