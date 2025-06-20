import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, MapPin, Calendar, Star, Building, DollarSign, Home } from 'lucide-react';
import { Broker, BrokerStatus } from '../types/broker';

interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  broker?: Broker | null;
  mode: 'view' | 'edit' | 'create';
  onSave: (data: Partial<Broker>) => void;
  loading?: boolean;
}

export const BrokerModal: React.FC<BrokerModalProps> = ({
  isOpen,
  onClose,
  broker,
  mode,
  onSave,
  loading = false
}) => {
  const [formData, setFormData] = useState<Partial<Broker>>({
    name: '',
    phone: '',
    email: '',
    area: '',
    specializations: '',
    yearsOfExperience: null,
    status: BrokerStatus.ACTIVE,
    rating: 0,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (broker && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: broker.name || '',
        phone: broker.phone || '',
        email: broker.email || '',
        area: broker.area || '',
        specializations: broker.specializations || '',
        yearsOfExperience: broker.yearsOfExperience || null,
        status: broker.status || BrokerStatus.ACTIVE,
        rating: broker.rating || 0,
        notes: broker.notes || ''
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        phone: '',
        email: '',
        area: '',
        specializations: '',
        yearsOfExperience: null,
        status: BrokerStatus.ACTIVE,
        rating: 0,
        notes: ''
      });
    }
    setErrors({});
  }, [broker, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'اسم السمسار مطلوب';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    if (formData.email && formData.email.trim() && 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'view') return;
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof Broker, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'إضافة سمسار جديد' : 
                mode === 'edit' ? `تعديل السمسار: ${broker?.name}` : 
                `تفاصيل السمسار: ${broker?.name}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate pr-4">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 ml-2" />
                المعلومات الأساسية
              </h3>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم السمسار *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } ${isReadOnly ? 'bg-gray-50' : ''}`}
                  placeholder="أدخل اسم السمسار"
                  dir="rtl"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } ${isReadOnly ? 'bg-gray-50' : ''}`}
                  placeholder="أدخل رقم الهاتف"
                  dir="ltr"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } ${isReadOnly ? 'bg-gray-50' : ''}`}
                  placeholder="أدخل البريد الإلكتروني"
                  dir="ltr"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المنطقة
                </label>
                <input
                  type="text"
                  value={formData.area || ''}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-50' : ''
                  }`}
                  placeholder="أدخل المنطقة"
                  dir="rtl"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  value={formData.status || BrokerStatus.ACTIVE}
                  onChange={(e) => handleInputChange('status', e.target.value as BrokerStatus)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value={BrokerStatus.ACTIVE}>نشط</option>
                  <option value={BrokerStatus.INACTIVE}>غير نشط</option>
                  <option value={BrokerStatus.SUSPENDED}>موقوف</option>
                  <option value={BrokerStatus.PENDING_VERIFICATION}>في انتظار التحقق</option>
                </select>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">المعلومات المهنية</h3>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التخصص
                </label>
                <input
                  type="text"
                  value={formData.specializations || ''}
                  onChange={(e) => handleInputChange('specializations', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-50' : ''
                  }`}
                  placeholder="مثل: شقق سكنية، فيلات، تجاري"
                  dir="rtl"
                />
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سنوات الخبرة
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsOfExperience || ''}
                  onChange={(e) => handleInputChange('yearsOfExperience', e.target.value ? parseInt(e.target.value) : null)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-50' : ''
                  }`}
                  placeholder="عدد سنوات الخبرة"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التقييم
                </label>
                <div className="flex items-center space-x-2 space-x-reverse">
                  {!isReadOnly ? (
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating || 0}
                      onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 ml-1" />
                      <span className="font-semibold">{formData.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-500">من 5</span>
                </div>
              </div>

              {/* Statistics for View Mode */}
              {mode === 'view' && broker && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">الإحصائيات</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{broker.totalProperties}</div>
                      <div className="text-xs text-gray-500">عقار</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{broker.activeDealCount}</div>
                      <div className="text-xs text-gray-500">صفقة نشطة</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{broker.totalDeals}</div>
                      <div className="text-xs text-gray-500">إجمالي الصفقات</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Activity for View Mode */}
              {mode === 'view' && broker?.lastActivity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    آخر نشاط
                  </label>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 ml-2" />
                    {new Date(broker.lastActivity).toLocaleDateString('ar-EG')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Properties Section - Only show in view mode */}
          {mode === 'view' && broker?.ownedProperties && broker.ownedProperties.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <Building className="h-5 w-5 ml-2" />
                العقارات المملوكة ({broker.ownedProperties.length})
              </h3>
              
              <div className="grid grid-cols-1 gap-4 max-h-80 sm:max-h-96 overflow-y-auto">
                {broker.ownedProperties.map((property) => (
                  <div key={property.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
                        {property.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        property.listingType === 'FOR_SALE' 
                          ? 'bg-green-100 text-green-800' 
                          : property.listingType === 'FOR_RENT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.listingType === 'FOR_SALE' ? 'للبيع' : 
                         property.listingType === 'FOR_RENT' ? 'للإيجار' : 
                         property.listingType === 'WANTED' ? 'مطلوب' : property.listingType}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {/* Property Type */}
                      <div className="flex items-center">
                        <Home className="h-4 w-4 ml-2 text-gray-400" />
                        <span>
                          {property.propertyType === 'APARTMENT' ? 'شقة' :
                           property.propertyType === 'HOUSE' ? 'منزل' :
                           property.propertyType === 'VILLA' ? 'فيلا' :
                           property.propertyType === 'OFFICE' ? 'مكتب' :
                           property.propertyType === 'SHOP' ? 'محل' :
                           property.propertyType === 'LAND' ? 'أرض' : property.propertyType}
                        </span>
                      </div>
                      
                      {/* Price */}
                      {property.price && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 ml-2 text-gray-400" />
                          <span className="font-semibold">
                            {property.price.toLocaleString()} {property.currency || 'جنيه'}
                          </span>
                          {property.negotiable && (
                            <span className="text-xs text-green-600 mr-2">(قابل للتفاوض)</span>
                          )}
                        </div>
                      )}
                      
                      {/* Area */}
                      {property.area && (
                        <div className="flex items-center">
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {property.area} م²
                          </span>
                        </div>
                      )}
                      
                      {/* Location */}
                      {property.location && (
                        <div className="flex items-center text-xs">
                          <MapPin className="h-3 w-3 ml-1 text-gray-400" />
                          <span className="truncate">{property.location}</span>
                        </div>
                      )}
                      
                      {/* Property details */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {property.bedrooms && (
                          <span className="bg-gray-200 px-2 py-1 rounded">{property.bedrooms} غرف</span>
                        )}
                        {property.bathrooms && (
                          <span className="bg-gray-200 px-2 py-1 rounded">{property.bathrooms} حمام</span>
                        )}
                        {property.floor && (
                          <span className="bg-gray-200 px-2 py-1 rounded">الطابق {property.floor}</span>
                        )}
                      </div>
                      
                      {/* Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-gray-200 gap-2">
                        <span className={`px-2 py-1 text-xs rounded self-start ${
                          property.status === 'AVAILABLE' 
                            ? 'bg-green-100 text-green-700' 
                            : property.status === 'SOLD'
                            ? 'bg-red-100 text-red-700'
                            : property.status === 'RENTED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {property.status === 'AVAILABLE' ? 'متاح' :
                           property.status === 'SOLD' ? 'مباع' :
                           property.status === 'RENTED' ? 'مؤجر' :
                           property.status === 'RESERVED' ? 'محجوز' : property.status}
                        </span>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{property.viewCount || 0} مشاهدة</span>
                          <span>•</span>
                          <span>{property.inquiryCount || 0} استفسار</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              disabled={isReadOnly}
              rows={4}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isReadOnly ? 'bg-gray-50' : ''
              }`}
              placeholder="أضف أي ملاحظات عن السمسار..."
              dir="rtl"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {mode === 'view' ? 'إغلاق' : 'إلغاء'}
            </button>
            
            {mode !== 'view' && (
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {mode === 'create' ? 'إضافة السمسار' : 'حفظ التغييرات'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
