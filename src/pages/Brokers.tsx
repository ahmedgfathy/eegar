import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Filter,
  UserCheck,
  Building,
  Star,
  Edit,
  Trash2,
  Eye,
  Plus
} from 'lucide-react';
import { brokerApi } from '../lib/broker-api';
import { Broker } from '../types/broker';
import { BrokerModal } from '../components/BrokerModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

export const Brokers: React.FC = () => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [brokerModal, setBrokerModal] = useState<{
    isOpen: boolean;
    broker: Broker | null;
    mode: 'view' | 'edit' | 'create';
  }>({
    isOpen: false,
    broker: null,
    mode: 'create'
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    broker: Broker | null;
  }>({
    isOpen: false,
    broker: null
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        setLoading(true);
        const brokersData = await brokerApi.getBrokers({
          search: searchTerm || undefined,
          status: statusFilter || undefined
        });
        setBrokers(brokersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load brokers');
      } finally {
        setLoading(false);
      }
    };

    fetchBrokers();
  }, [searchTerm, statusFilter]);

  // Helper functions
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const refreshBrokers = async () => {
    try {
      const brokersData = await brokerApi.getBrokers({
        search: searchTerm || undefined,
        status: statusFilter || undefined
      });
      setBrokers(brokersData);
    } catch (err) {
      console.error('Failed to refresh brokers:', err);
    }
  };

  // Modal handlers
  const handleCreateBroker = () => {
    setBrokerModal({
      isOpen: true,
      broker: null,
      mode: 'create'
    });
  };

  const handleViewBroker = async (broker: Broker) => {
    try {
      const fullBroker = await brokerApi.getBroker(broker.id);
      setBrokerModal({
        isOpen: true,
        broker: fullBroker,
        mode: 'view'
      });
    } catch (err) {
      showNotification('فشل في تحميل تفاصيل السمسار', 'error');
    }
  };

  const handleEditBroker = async (broker: Broker) => {
    try {
      const fullBroker = await brokerApi.getBroker(broker.id);
      setBrokerModal({
        isOpen: true,
        broker: fullBroker,
        mode: 'edit'
      });
    } catch (err) {
      showNotification('فشل في تحميل تفاصيل السمسار', 'error');
    }
  };

  const handleDeleteBroker = (broker: Broker) => {
    setDeleteModal({
      isOpen: true,
      broker
    });
  };

  const closeBrokerModal = () => {
    setBrokerModal({
      isOpen: false,
      broker: null,
      mode: 'create'
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      broker: null
    });
  };

  const handleSaveBroker = async (data: Partial<Broker>) => {
    try {
      setActionLoading(true);
      
      if (brokerModal.mode === 'create') {
        await brokerApi.createBroker(data);
        showNotification('تم إضافة السمسار بنجاح', 'success');
      } else if (brokerModal.mode === 'edit' && brokerModal.broker) {
        await brokerApi.updateBroker(brokerModal.broker.id, data);
        showNotification('تم تحديث السمسار بنجاح', 'success');
      }
      
      await refreshBrokers();
      closeBrokerModal();
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ السمسار',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.broker) return;
    
    try {
      setActionLoading(true);
      const result = await brokerApi.deleteBroker(deleteModal.broker.id);
      
      if (result.soft_delete) {
        showNotification('تم إلغاء تفعيل السمسار بدلاً من الحذف بسبب وجود بيانات مرتبطة', 'success');
      } else {
        showNotification('تم حذف السمسار بنجاح', 'success');
      }
      
      await refreshBrokers();
      closeDeleteModal();
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'حدث خطأ أثناء حذف السمسار',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Filter brokers
  const filteredBrokers = brokers.filter(broker => {
    const matchesSearch = broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broker.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broker.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || broker.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status utilities
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      case 'PENDING_VERIFICATION': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'نشط';
      case 'INACTIVE': return 'غير نشط';
      case 'SUSPENDED': return 'موقوف';
      case 'PENDING_VERIFICATION': return 'في انتظار التحقق';
      default: return status;
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">السماسرة</h1>
              <p className="text-gray-600">إدارة شبكة السماسرة والتواصل معهم</p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <button 
                onClick={handleCreateBroker}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 ml-2" />
                إضافة سمسار
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4 md:space-x-reverse">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث في السماسرة..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                dir="rtl"
              />
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">جميع الحالات</option>
                <option value="ACTIVE">نشط</option>
                <option value="INACTIVE">غير نشط</option>
                <option value="SUSPENDED">موقوف</option>
                <option value="PENDING_VERIFICATION">في انتظار التحقق</option>
              </select>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي السماسرة</p>
                <p className="text-2xl font-bold text-gray-900">{brokers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">النشطون</p>
                <p className="text-2xl font-bold text-green-600">
                  {brokers.filter(b => b.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي العقارات</p>
                <p className="text-2xl font-bold text-purple-600">
                  {brokers.reduce((sum, b) => sum + b.totalProperties, 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط التقييم</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(brokers.filter(b => b.rating).reduce((sum, b) => sum + (b.rating || 0), 0) / 
                    brokers.filter(b => b.rating).length || 0).toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Brokers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrokers.map((broker) => (
            <div key={broker.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {broker.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{broker.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(broker.status)}`}>
                      {getStatusText(broker.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <button 
                    onClick={() => handleViewBroker(broker)}
                    className="p-1 hover:bg-blue-100 rounded text-blue-600"
                    title="عرض التفاصيل"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEditBroker(broker)}
                    className="p-1 hover:bg-green-100 rounded text-green-600"
                    title="تعديل"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteBroker(broker)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {broker.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span dir="ltr">{broker.phone}</span>
                  </div>
                )}
                {broker.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{broker.email}</span>
                  </div>
                )}
                {broker.area && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{broker.area}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{broker.totalProperties}</p>
                  <p className="text-xs text-gray-500">عقار</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{broker.activeDealCount}</p>
                  <p className="text-xs text-gray-500">صفقة نشطة</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <p className="text-lg font-semibold text-gray-900">
                      {broker.rating?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">تقييم</p>
                </div>
              </div>

              {/* Last Activity */}
              {broker.lastActivity && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">آخر نشاط:</span>
                    <span className="text-gray-700">
                      {new Date(broker.lastActivity).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center space-x-2 space-x-reverse">
                <button 
                  onClick={() => handleViewBroker(broker)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 ml-1" />
                  عرض التفاصيل
                </button>
                <button 
                  onClick={() => handleEditBroker(broker)}
                  className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <Edit className="h-4 w-4 ml-1" />
                  تعديل
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBrokers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد سماسرة</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter ? 'لم يتم العثور على سماسرة مطابقة للبحث' : 'لم يتم إضافة أي سماسرة بعد'}
            </p>
            {!searchTerm && !statusFilter && (
              <button 
                onClick={handleCreateBroker}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                إضافة أول سمسار
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Broker Modal */}
      <BrokerModal
        isOpen={brokerModal.isOpen}
        onClose={closeBrokerModal}
        broker={brokerModal.broker}
        mode={brokerModal.mode}
        onSave={handleSaveBroker}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="حذف السمسار"
        message={`هل أنت متأكد من حذف السمسار "${deleteModal.broker?.name}"؟ هذا الإجراء لا يمكن التراجع عنه. إذا كان لدى السمسار عقارات أو رسائل مرتبطة، سيتم إلغاء تفعيله بدلاً من الحذف.`}
        confirmText="حذف السمسار"
        loading={actionLoading}
        type="danger"
      />
    </div>
  );
};