export interface Broker {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  area: string | null;
  company: string | null;
  status: BrokerStatus;
  licenseNumber: string | null;
  yearsOfExperience: number | null;
  specializations: string | null;
  profileImage: string | null;
  totalProperties: number;
  activeDealCount: number;
  lastActivity: Date | null;
  rating: number | null;
  totalDeals: number;
  preferredContactMethod: ContactMethod;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: number;
  title: string;
  description: string | null;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number | null;
  pricePerMeter: number | null;
  currency: string;
  negotiable: boolean;
  area: number | null;
  location: string | null;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  district: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  floor: number | null;
  parking: boolean;
  furnished: boolean;
  balcony: boolean;
  elevator: boolean;
  features: string | null;
  condition: PropertyCondition | null;
  buildingAge: number | null;
  status: PropertyStatus;
  featured: boolean;
  urgentSale: boolean;
  extractedFromMessage: boolean;
  sourceMessageId: number | null;
  ownerId: number | null;
  images: string | null;
  viewCount: number;
  inquiryCount: number;
  createdAt: Date;
  updatedAt: Date;
  owner?: Broker;
}

export interface Message {
  id: number;
  brokerId: number;
  content: string;
  messageDate: Date;
  messageTime: string;
  attachments: string | null;
  messageType: MessageType;
  containsPropertyInfo: boolean;
  extractedPropertyId: number | null;
  sentiment: string | null;
  language: string | null;
  createdAt: Date;
  broker?: Broker;
  extractedProperty?: Property;
}

export interface PropertyInquiry {
  id: number;
  brokerId: number;
  propertyId: number;
  senderId: number | null;
  inquiryType: InquiryType;
  inquiryDate: Date;
  message: string | null;
  status: InquiryStatus;
  budget: number | null;
  clientRequirements: string | null;
  urgency: Priority;
  responseDate: Date | null;
  response: string | null;
  broker?: Broker;
  property?: Property;
  sender?: Broker;
}

export enum BrokerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export enum ContactMethod {
  WHATSAPP = 'WHATSAPP',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  IN_PERSON = 'IN_PERSON'
}

export enum ListingType {
  FOR_SALE = 'FOR_SALE',
  FOR_RENT = 'FOR_RENT',
  WANTED = 'WANTED',
  SOLD = 'SOLD',
  RENTED = 'RENTED'
}

export enum PropertyCondition {
  NEW = 'NEW',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  NEEDS_RENOVATION = 'NEEDS_RENOVATION'
}

export enum InquiryType {
  GENERAL = 'GENERAL',
  VIEWING_REQUEST = 'VIEWING_REQUEST',
  PRICE_INQUIRY = 'PRICE_INQUIRY',
  AVAILABILITY_CHECK = 'AVAILABILITY_CHECK',
  NEGOTIATION = 'NEGOTIATION',
  REFERRAL = 'REFERRAL'
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
  LINK = 'LINK',
  LOCATION = 'LOCATION'
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  DUPLEX = 'DUPLEX',
  PENTHOUSE = 'PENTHOUSE',
  OFFICE = 'OFFICE',
  SHOP = 'SHOP',
  WAREHOUSE = 'WAREHOUSE',
  LAND = 'LAND',
  GARAGE = 'GARAGE',
  STUDIO = 'STUDIO'
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  RESERVED = 'RESERVED',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
  OFF_MARKET = 'OFF_MARKET'
}

export enum InquiryStatus {
  PENDING = 'PENDING',
  RESPONDED = 'RESPONDED',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

// Dashboard Stats
export interface DashboardStats {
  totalBrokers: number;
  totalProperties: number;
  totalMessages: number;
  totalInquiries: number;
  propertiesForSale: number;
  propertiesForRent: number;
  propertiesWanted: number;
  activeBrokers: number;
  recentActivity: Message[];
  topBrokers: Broker[];
  propertyTypeDistribution: Array<{ type: string; count: number }>;
  listingTypeDistribution: Array<{ type: string; count: number }>;
}
