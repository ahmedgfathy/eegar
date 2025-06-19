import axios from 'axios';
import { 
  Contact, 
  Property, 
  Message, 
  ContactFormData, 
  PropertyFormData, 
  ApiResponse, 
  PaginatedResponse,
  DashboardStats
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Contacts API
export const contactsApi = {
  // Get all contacts
  getAll: async (): Promise<Contact[]> => {
    const response = await api.get('/contacts');
    return response.data;
  },

  // Get contact by ID
  getById: async (id: number): Promise<Contact> => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  // Update contact
  update: async (id: number, data: Partial<ContactFormData>): Promise<Contact> => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },

  // Delete contact
  delete: async (id: number): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },

  // Import contacts from CSV
  importFromCsv: async (file: File): Promise<ApiResponse<{ imported: number; errors: any[] }>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/contacts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Properties API
export const propertiesApi = {
  // Get all properties
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<PaginatedResponse<Property>> => {
    const response = await api.get('/properties', { params });
    return response.data;
  },

  // Get property by ID
  getById: async (id: number): Promise<Property> => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  // Create new property
  create: async (data: PropertyFormData): Promise<Property> => {
    const response = await api.post('/properties', data);
    return response.data;
  },

  // Update property
  update: async (id: number, data: Partial<PropertyFormData>): Promise<Property> => {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  },

  // Delete property
  delete: async (id: number): Promise<void> => {
    await api.delete(`/properties/${id}`);
  },
};

// Messages API
export const messagesApi = {
  // Get messages for a contact
  getByContact: async (contactId: number): Promise<Message[]> => {
    const response = await api.get(`/contacts/${contactId}/messages`);
    return response.data;
  },

  // Create new message
  create: async (data: {
    contactId: number;
    content: string;
    messageDate: string;
    messageTime: string;
    messageType?: string;
    attachments?: string;
  }): Promise<Message> => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  // Get recent messages
  getRecent: async (limit?: number): Promise<Message[]> => {
    const response = await api.get('/messages/recent', { params: { limit } });
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

// Utility functions
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;