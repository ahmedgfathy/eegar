import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  MessageSquare, 
  TrendingUp, 
  Home, 
  UserCheck, 
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star
} from 'lucide-react';
import { brokerApi } from '../lib/broker-api';
import { DashboardStats, Broker, Message } from '../types/broker';

export const BrokerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard stats...');
        const dashboardStats = await brokerApi.getDashboardStats();
        console.log('Dashboard stats received:', dashboardStats);
        setStats(dashboardStats);
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️ خطأ</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'إجمالي السماسرة',
      value: stats.totalBrokers || 0,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'العقارات المتاحة',
      value: stats.totalProperties || 0,
      icon: Building,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'إجمالي الرسائل',
      value: stats.totalMessages || 0,
      icon: MessageSquare,
      color: 'bg-purple-500',
      trend: '+15%',
      trendUp: true
    },
    {
      title: 'السماسرة النشطون',
      value: stats.activeBrokers || 0,
      icon: UserCheck,
      color: 'bg-orange-500',
      trend: '+5%',
      trendUp: true
    }
  ];

  const listingTypeCards = [
    {
      title: 'للبيع',
      value: stats.propertiesForSale || 0,
      icon: Home,
      color: 'bg-red-500'
    },
    {
      title: 'للإيجار',
      value: stats.propertiesForRent || 0,
      icon: Building,
      color: 'bg-blue-500'
    },
    {
      title: 'مطلوب',
      value: stats.propertiesWanted || 0,
      icon: TrendingUp,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم CRM العقارات</h1>
          <p className="text-gray-600">مرحباً بك في نظام إدارة علاقات العملاء العقاري</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value.toLocaleString('ar-EG')}</p>
                  <div className="flex items-center mt-2">
                    {card.trendUp ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {card.trend}
                    </span>
                  </div>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Property Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {listingTypeCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value.toLocaleString('ar-EG')}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity and Top Brokers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              النشاط الأخير
            </h3>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((message, index) => (
                  <div key={index} className="flex items-start space-x-3 space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {message.broker?.name || 'سمسار غير معروف'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {message.content?.substring(0, 100)}...
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(message.messageDate).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>لا يوجد نشاط حديث</p>
              </div>
            )}
          </div>

          {/* Top Brokers */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              أفضل السماسرة
            </h3>
            {stats.topBrokers && stats.topBrokers.length > 0 ? (
              <div className="space-y-3">
                {stats.topBrokers.map((broker, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{broker.name}</p>
                        <p className="text-xs text-gray-500">{broker.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{broker.totalProperties}</p>
                      <p className="text-xs text-gray-500">عقار</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>لا توجد بيانات سماسرة متاحة</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-600 font-medium">إدارة السماسرة</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
              <Building className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-600 font-medium">إضافة عقار</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
              <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-purple-600 font-medium">الرسائل</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-orange-600 font-medium">التقارير</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};