import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  MessageSquare, 
  Phone, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { Contact, Message, DashboardStats } from '../types';
import { dashboardApi, contactsApi } from '../lib/api';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
}> = ({ title, value, icon, change, changeType }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-100 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

const RecentContactCard: React.FC<{ contact: Contact }> = ({ contact }) => {
  return (
    <div className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          <Users className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="ml-4 flex-1">
        <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
        <p className="text-sm text-gray-500">{contact.phone || 'No phone'}</p>
        <div className="flex items-center mt-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            contact.status === 'NEW_LEAD' ? 'bg-blue-100 text-blue-800' :
            contact.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
            contact.status === 'QUALIFIED' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {contact.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <Calendar className="h-4 w-4 mr-1" />
        {new Date(contact.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const dashboardStats = await dashboardApi.getStats();
        
        // Fetch recent contacts (limited to first 5)
        const allContacts = await contactsApi.getAll();
        const limitedContacts = allContacts.slice(0, 5);
        
        setStats(dashboardStats);
        setRecentContacts(limitedContacts);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set fallback data if API fails
        setStats({
          totalContacts: 0,
          totalMessages: 0,
          qualifiedLeads: 0,
          newLeads: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your real estate business.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Contacts"
          value={stats?.totalContacts || 0}
          icon={<Users className="h-6 w-6 text-primary-600" />}
          change="+12% from last month"
          changeType="increase"
        />
        <StatCard
          title="New Leads"
          value={stats?.newLeads || 0}
          icon={<Phone className="h-6 w-6 text-primary-600" />}
          change="+8% from last week"
          changeType="increase"
        />
        <StatCard
          title="Qualified Leads"
          value={stats?.qualifiedLeads || 0}
          icon={<Building className="h-6 w-6 text-primary-600" />}
          change="+3 new this week"
          changeType="increase"
        />
        <StatCard
          title="Total Messages"
          value={stats?.totalMessages || 0}
          icon={<MessageSquare className="h-6 w-6 text-primary-600" />}
          change="+18% from last month"
          changeType="increase"
        />
      </div>

      {/* Recent Contacts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Contacts</h2>
          <button className="text-sm text-primary-600 hover:text-primary-700">
            View all
          </button>
        </div>
        <div className="space-y-3">
          {recentContacts.length > 0 ? (
            recentContacts.map((contact) => (
              <RecentContactCard key={contact.id} contact={contact} />
            ))
          ) : (
            <p className="text-gray-500">No contacts found</p>
          )}
        </div>
      </div>
    </div>
  );
};
