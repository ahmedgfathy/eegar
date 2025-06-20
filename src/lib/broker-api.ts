import { Broker, Property, Message, DashboardStats, PropertyInquiry } from '../types/broker';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

export const brokerApi = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    return response.json();
  },

  // Brokers
  async getBrokers(params?: {
    search?: string;
    status?: string;
    limit?: number;
  }): Promise<Broker[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    else queryParams.append('limit', '1000'); // Default to higher limit to show all brokers
    
    const url = `${API_BASE_URL}/brokers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch brokers');
    }
    return response.json();
  },

  async getBroker(id: number): Promise<Broker> {
    const response = await fetch(`${API_BASE_URL}/brokers/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch broker');
    }
    return response.json();
  },

  async updateBroker(id: number, data: Partial<Broker>): Promise<Broker> {
    const response = await fetch(`${API_BASE_URL}/brokers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update broker');
    }
    return response.json();
  },

  async createBroker(data: Partial<Broker>): Promise<Broker> {
    const response = await fetch(`${API_BASE_URL}/brokers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create broker');
    }
    return response.json();
  },

  async deleteBroker(id: number): Promise<{ message: string; soft_delete: boolean }> {
    const response = await fetch(`${API_BASE_URL}/brokers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete broker');
    }
    return response.json();
  },

  // Properties
  async getProperties(filters?: {
    listingType?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    brokerId?: number;
    limit?: number;
  }): Promise<Property[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    // Set default limit to show all properties unless specified
    if (!filters?.limit) {
      params.append('limit', '2000');
    }
    
    const response = await fetch(`${API_BASE_URL}/properties?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    return response.json();
  },

  async getProperty(id: number): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch property');
    }
    return response.json();
  },

  async createProperty(data: Partial<Property>): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create property');
    }
    return response.json();
  },

  async updateProperty(id: number, data: Partial<Property>): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update property');
    }
    return response.json();
  },

  async deleteProperty(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete property');
    }
  },

  // Messages
  async getMessages(brokerId?: number): Promise<Message[]> {
    const params = brokerId ? `?brokerId=${brokerId}` : '';
    const response = await fetch(`${API_BASE_URL}/messages${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return response.json();
  },

  async getMessagesByProperty(propertyId: number): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/messages/property/${propertyId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return response.json();
  },

  // Property Inquiries
  async getPropertyInquiries(propertyId?: number, brokerId?: number): Promise<PropertyInquiry[]> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (brokerId) params.append('brokerId', brokerId.toString());
    
    const response = await fetch(`${API_BASE_URL}/inquiries?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch inquiries');
    }
    return response.json();
  },

  async createPropertyInquiry(data: Partial<PropertyInquiry>): Promise<PropertyInquiry> {
    const response = await fetch(`${API_BASE_URL}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create inquiry');
    }
    return response.json();
  },

  async updatePropertyInquiry(id: number, data: Partial<PropertyInquiry>): Promise<PropertyInquiry> {
    const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update inquiry');
    }
    return response.json();
  },

  async respondToInquiry(id: number, response: string): Promise<PropertyInquiry> {
    const data = await fetch(`${API_BASE_URL}/inquiries/${id}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ response }),
    });
    if (!data.ok) {
      throw new Error('Failed to respond to inquiry');
    }
    return data.json();
  }
};
