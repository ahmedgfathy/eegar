import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Home, 
  MapPin, 
  DollarSign, 
  Search, 
  Filter,
  Eye,
  Heart,
  Share2,
  Phone,
  MessageSquare,
  User,
  Calendar,
  Square,
  Bed,
  Bath,
  Car,
  Wifi,
  Star,
  TrendingUp
} from 'lucide-react';
import { brokerApi } from '../lib/broker-api';
import { Property, PropertyType, ListingType } from '../types/broker';

export const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState<string>('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const filters: any = {};
        if (listingTypeFilter) filters.listingType = listingTypeFilter;
        if (propertyTypeFilter) filters.propertyType = propertyTypeFilter;
        if (priceRange.min) filters.minPrice = parseFloat(priceRange.min);
        if (priceRange.max) filters.maxPrice = parseFloat(priceRange.max);
        
        const propertiesData = await brokerApi.getProperties(filters);
        setProperties(propertiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [listingTypeFilter, propertyTypeFilter, priceRange]);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'FOR_SALE': return 'bg-green-100 text-green-800';
      case 'FOR_RENT': return 'bg-blue-100 text-blue-800';
      case 'WANTED': return 'bg-purple-100 text-purple-800';
      case 'SOLD': return 'bg-gray-100 text-gray-800';
      case 'RENTED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getListingTypeText = (type: string) => {
    switch (type) {
      case 'FOR_SALE': return 'للبيع';
      case 'FOR_RENT': return 'للإيجار';
      case 'WANTED': return 'مطلوب';
      case 'SOLD': return 'مُباع';
      case 'RENTED': return 'مؤجر';
      default: return type;
    }
  };

  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case 'APARTMENT': return 'شقة';
      case 'HOUSE': return 'منزل';
      case 'VILLA': return 'فيلا';
      case 'OFFICE': return 'مكتب';
      case 'SHOP': return 'محل';
      case 'LAND': return 'أرض';
      case 'WAREHOUSE': return 'مخزن';
      default: return type;
    }
  };

  const formatPrice = (price: number | null, currency: string = 'EGP') => {
    if (!price) return 'السعر غير محدد';
    return `${price.toLocaleString()} ${currency === 'EGP' ? 'جنيه' : currency}`;
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">العقارات</h1>
              <p className="text-gray-600">استعرض وإدارة العقارات المتاحة في الشبكة</p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Building className="h-5 w-5 mr-2" />
                إضافة عقار
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث في العقارات..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                dir="rtl"
              />
            </div>

            {/* Listing Type Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={listingTypeFilter}
                onChange={(e) => setListingTypeFilter(e.target.value)}
              >
                <option value="">جميع الأنواع</option>
                <option value="FOR_SALE">للبيع</option>
                <option value="FOR_RENT">للإيجار</option>
                <option value="WANTED">مطلوب</option>
              </select>
            </div>

            {/* Property Type Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={propertyTypeFilter}
                onChange={(e) => setPropertyTypeFilter(e.target.value)}
              >
                <option value="">نوع العقار</option>
                <option value="APARTMENT">شقة</option>
                <option value="HOUSE">منزل</option>
                <option value="VILLA">فيلا</option>
                <option value="OFFICE">مكتب</option>
                <option value="SHOP">محل</option>
                <option value="LAND">أرض</option>
              </select>
            </div>

            {/* Filter Button */}
            <div>
              <button className="w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="mr-2">فلترة</span>
              </button>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-4 flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse">
              <label className="text-sm text-gray-600">من:</label>
              <input
                type="number"
                placeholder="0"
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <label className="text-sm text-gray-600">إلى:</label>
              <input
                type="number"
                placeholder="∞"
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>
            <span className="text-sm text-gray-500">جنيه</span>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي العقارات</p>
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">للبيع</p>
                <p className="text-2xl font-bold text-green-600">
                  {properties.filter(p => p.listingType === 'FOR_SALE').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Home className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">للإيجار</p>
                <p className="text-2xl font-bold text-blue-600">
                  {properties.filter(p => p.listingType === 'FOR_RENT').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مطلوب</p>
                <p className="text-2xl font-bold text-purple-600">
                  {properties.filter(p => p.listingType === 'WANTED').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Property Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building className="h-16 w-16 text-gray-400" />
                </div>
                
                {/* Badges */}
                <div className="absolute top-4 right-4 flex space-x-2 space-x-reverse">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getListingTypeColor(property.listingType)}`}>
                    {getListingTypeText(property.listingType)}
                  </span>
                  {property.featured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      مميز
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                    <Share2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* View Count */}
                <div className="absolute bottom-4 left-4 flex items-center bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  {property.viewCount}
                </div>
              </div>

              {/* Property Details */}
              <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate" dir="rtl">
                      {property.title}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2">
                      {getPropertyTypeText(property.propertyType)}
                    </span>
                  </div>
                  
                  {property.location && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      <span dir="rtl">{property.location}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-green-600">
                      {formatPrice(property.price, property.currency)}
                    </div>
                    {property.pricePerMeter && (
                      <div className="text-sm text-gray-500">
                        {property.pricePerMeter.toLocaleString()} جنيه/متر
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Features */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  {property.area && (
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{property.area} متر²</span>
                    </div>
                  )}
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  {property.parking && (
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-1" />
                    </div>
                  )}
                </div>

                {/* Description */}
                {property.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2" dir="rtl">
                    {property.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  {/* Broker Info */}
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {property.owner?.name || 'سمسار'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {property.owner?.phone}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Posted Date */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(property.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  {property.extractedFromMessage && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      مستخرج من الرسائل
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد عقارات</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || listingTypeFilter || propertyTypeFilter 
                ? 'لم يتم العثور على عقارات مطابقة للبحث' 
                : 'لم يتم إضافة أي عقارات بعد'}
            </p>
            {!searchTerm && !listingTypeFilter && !propertyTypeFilter && (
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                إضافة أول عقار
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};