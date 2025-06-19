// Contact Management Types
export enum ContactStatus {
  NEW_LEAD = 'NEW_LEAD',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  VIEWING_SCHEDULED = 'VIEWING_SCHEDULED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATING = 'NEGOTIATING',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
  FOLLOW_UP = 'FOLLOW_UP'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  VOICE = 'VOICE',
  VIDEO = 'VIDEO',
  LINK = 'LINK'
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  OFFICE = 'OFFICE',
  SHOP = 'SHOP',
  WAREHOUSE = 'WAREHOUSE',
  LAND = 'LAND'
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  RESERVED = 'RESERVED',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION'
}

export enum InquiryStatus {
  PENDING = 'PENDING',
  RESPONDED = 'RESPONDED',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Main Data Models
export interface Contact {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  area?: string;
  status: ContactStatus;
  priority: Priority;
  source?: string;
  notes?: string;
  lastContact?: Date;
  nextFollowUp?: Date;
  propertyType?: string;
  budget?: number;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
  properties?: PropertyInquiry[];
}

export interface Message {
  id: number;
  contactId: number;
  content: string;
  messageDate: Date;
  messageTime: string;
  attachments?: string;
  messageType: MessageType;
  createdAt: Date;
  contact?: Contact;
}

export interface Property {
  id: number;
  title: string;
  description?: string;
  propertyType: PropertyType;
  price: number;
  area: number;
  location: string;
  address?: string;
  city: string;
  neighborhood?: string;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  parking: boolean;
  furnished: boolean;
  status: PropertyStatus;
  featured: boolean;
  images?: string;
  createdAt: Date;
  updatedAt: Date;
  inquiries?: PropertyInquiry[];
}

export interface PropertyInquiry {
  id: number;
  contactId: number;
  propertyId: number;
  inquiryDate: Date;
  message?: string;
  status: InquiryStatus;
  contact?: Contact;
  property?: Property;
}

// Form Types
export interface ContactFormData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  area?: string;
  status: ContactStatus;
  priority: Priority;
  source?: string;
  notes?: string;
  nextFollowUp?: string;
  propertyType?: string;
  budget?: number;
  location?: string;
}

export interface PropertyFormData {
  title: string;
  description?: string;
  propertyType: PropertyType;
  price: number;
  area: number;
  location: string;
  address?: string;
  city: string;
  neighborhood?: string;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  parking: boolean;
  furnished: boolean;
  status: PropertyStatus;
  featured: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard Statistics
export interface DashboardStats {
  totalContacts: number;
  newLeads: number;
  activeProperties: number;
  monthlyRevenue: number;
  recentContacts: Contact[];
  recentMessages: Message[];
  statusDistribution: {
    status: ContactStatus;
    count: number;
  }[];
}