import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, Home, Phone, Eye, Heart } from 'lucide-react';
import { Property } from '../types/broker';
import { brokerApi } from '../lib/broker-api';
import { userApi } from '../lib/user-api';
import Logo from '../components/Logo';

interface UserData {
  id: string;
  mobile: string;
  isVerified: boolean;
  createdAt: string;
}

export const UserDashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'properties' | 'users'>('properties');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch properties
      const propertiesData = await brokerApi.getProperties({ limit: 100 });
      setProperties(propertiesData);

      // Fetch users from API
      const usersData = await userApi.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case 'APARTMENT': return 'شقة';
      case 'VILLA': return 'فيلا';
      case 'HOUSE': return 'منزل';
      case 'OFFICE': return 'مكتب';
      case 'SHOP': return 'محل';
      case 'LAND': return 'أرض';
      default: return type;
    }
  };

  const getListingTypeText = (type: string) => {
    switch (type) {
      case 'FOR_SALE': return 'للبيع';
      case 'FOR_RENT': return 'للإيجار';
      case 'WANTED': return 'مطلوب';
      default: return type;
    }
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'FOR_SALE': return 'bg-green-100 text-green-800';
      case 'FOR_RENT': return 'bg-blue-100 text-blue-800';
      case 'WANTED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            
            <div className="flex items-center space-x-4 space-x-reverse">
              {isAdmin && (
                <a
                  href="/admin-panel"
                  className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <Users className="h-5 w-5" />
                  <span>لوحة الإدارة</span>
                </a>
              )}
              <div className="text-right">
                <p className="text-sm text-gray-500">مرحباً</p>
                <p className="font-semibold text-gray-900">{user?.mobile}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            مرحباً بك في لوحة التحكم
          </h1>
          <p className="text-gray-600">
            يمكنك الآن الوصول إلى جميع العقارات وبيانات المستخدمين في النظام
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">إجمالي العقارات</p>
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">المستخدمين المفعلين</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.isVerified).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 space-x-reverse px-6">
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'properties'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                العقارات ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                المستخدمين ({users.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div className="space-y-4">
                {properties.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد عقارات متاحة حالياً</p>
                  </div>
                ) : (
                  properties.map((property) => (
                    <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 space-x-reverse mb-2">
                            <h3 className="font-semibold text-gray-900">{property.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getListingTypeColor(property.listingType)}`}>
                              {getListingTypeText(property.listingType)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>النوع:</strong> {getPropertyTypeText(property.propertyType)}
                            </div>
                            <div>
                              <strong>الموقع:</strong> {property.location || 'غير محدد'}
                            </div>
                            <div>
                              <strong>السعر:</strong> {property.price ? `${property.price.toLocaleString()} جنيه` : 'غير محدد'}
                            </div>
                          </div>
                          
                          {property.description && (
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                              {property.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 space-x-reverse mt-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 ml-1" />
                              {property.owner?.phone || 'غير متوفر'}
                            </div>
                            <div>
                              <strong>الوسيط:</strong> {property.owner?.name || 'غير محدد'}
                            </div>
                          </div>
                        </div>
                        
                        {property.images && property.images.length > 0 && (
                          <div className="mr-4">
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا يوجد مستخدمين مسجلين</p>
                  </div>
                ) : (
                  users.map((userData) => (
                    <div key={userData.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <h3 className="font-semibold text-gray-900" dir="ltr">
                                {userData.mobile}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                userData.isVerified 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {userData.isVerified ? 'مفعّل' : 'غير مفعّل'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              تاريخ التسجيل: {formatDate(userData.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-500">رقم المستخدم</p>
                          <p className="font-mono text-sm text-gray-900">#{userData.id}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
