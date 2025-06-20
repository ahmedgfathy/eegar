import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Eye,// Header Component
const PublicHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-3 rounded-lg ml-8">
              <Building className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">اي ايجار</h1>
          </div>ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  Building,
  Lock,
  X,
  Crown,
  Check
} from 'lucide-react';
import { brokerApi } from '../lib/broker-api';
import { Property } from '../types/broker';

// Search filters interface
interface SearchFilters {
  searchTerm: string;
  listingType: string;
  propertyType: string;
}

// Subscription Modal Component
const SubscriptionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center">
          <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Crown className="h-8 w-8 text-yellow-600" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            اشترك للوصول لتفاصيل التواصل
          </h3>
          
          <p className="text-gray-600 mb-6">
            احصل على وصول كامل لأرقام الوسطاء وتفاصيل التواصل مع أصحاب العقارات
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold">باقة شهرية</span>
              <span className="text-2xl font-bold text-blue-600">99 جنيه</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 ml-2" />
                وصول لجميع أرقام الوسطاء
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 ml-2" />
                تفاصيل تواصل أصحاب العقارات
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 ml-2" />
                إشعارات العقارات الجديدة
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 ml-2" />
                دعم فني على مدار الساعة
              </li>
            </ul>
          </div>
          
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold mb-3">
            اشترك الآن
          </button>
          
          <p className="text-xs text-gray-500">
            يمكنك إلغاء الاشتراك في أي وقت
          </p>
        </div>
      </div>
    </div>
  );
};

// Header Component
const PublicHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-3 rounded-lg ml-8">
              <Building className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">اي ايجار</h1>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-16 space-x-reverse">
            <a href="#home" className="text-blue-600 font-semibold hover:text-blue-700 px-3 py-2">الرئيسية</a>
            <a href="#sale" className="text-gray-700 hover:text-blue-600 px-3 py-2">للبيع</a>
            <a href="#rent" className="text-gray-700 hover:text-blue-600 px-3 py-2">للإيجار</a>
            <a href="#agents" className="text-gray-700 hover:text-blue-600 px-3 py-2">الوسطاء</a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 px-3 py-2">من نحن</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 px-3 py-2">تواصل معنا</a>
          </nav>
          
          {/* Login Button */}
          <button 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg"
            onClick={() => window.location.href = '/admin'}
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    </header>
  );
};

// Hero Section Component
const HeroSection: React.FC<{ properties: Property[], onSearch: (filters: SearchFilters) => void }> = ({ properties, onSearch }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [listingType, setListingType] = useState('');
  const [propertyType, setPropertyType] = useState('');
  
  // Get top 3 properties for hero slider
  const heroProperties = properties.slice(0, 3);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(heroProperties.length, 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [heroProperties.length]);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(heroProperties.length, 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(heroProperties.length, 1)) % Math.max(heroProperties.length, 1));
  };

  const handleSearch = () => {
    onSearch({
      searchTerm,
      listingType,
      propertyType
    });
  };
  
  return (
    <div className="relative h-96 md:h-[600px] overflow-hidden">
      {/* Background Slider */}
      <div className="absolute inset-0">
        {heroProperties.length > 0 ? (
          heroProperties.map((property, index) => (
            <div
              key={property.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
      </div>
      
      {/* Navigation Arrows */}
      {heroProperties.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      
      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-6 max-w-6xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-12">
            اكتشف منزل أحلامك
          </h1>
          <p className="text-2xl md:text-3xl mb-16 opacity-90">
            آلاف العقارات المميزة في العاشر من رمضان وما حولها
          </p>
          
          {/* Search Filter Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-6xl mx-auto shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="ابحث بالمنطقة أو رقم الوسيط..."
                  className="w-full pr-12 pl-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir="rtl"
                />
              </div>
              
              {/* Listing Type */}
              <select
                className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
              >
                <option value="">نوع العرض</option>
                <option value="FOR_SALE">للبيع</option>
                <option value="FOR_RENT">للإيجار</option>
                <option value="WANTED">مطلوب</option>
              </select>
              
              {/* Property Type */}
              <select
                className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">نوع العقار</option>
                <option value="APARTMENT">شقة</option>
                <option value="VILLA">فيلا</option>
                <option value="HOUSE">منزل</option>
                <option value="OFFICE">مكتب</option>
                <option value="SHOP">محل</option>
                <option value="LAND">أرض</option>
              </select>
              
              {/* Search Button */}
              <button 
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                onClick={handleSearch}
              >
                <Search className="h-5 w-5 ml-2" />
                بحث
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slide Indicators */}
      {heroProperties.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 space-x-reverse">
          {heroProperties.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Property Card Component
const PropertyCard: React.FC<{ 
  property: Property; 
  showPhone?: boolean; 
  onSubscriptionClick: () => void;
}> = ({ 
  property, 
  showPhone = false,
  onSubscriptionClick
}) => {
  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'FOR_SALE': return 'bg-green-100 text-green-800';
      case 'FOR_RENT': return 'bg-blue-100 text-blue-800';
      case 'WANTED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Property Image */}
      <div className="relative h-48">
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getListingTypeColor(property.listingType)}`}>
            {getListingTypeText(property.listingType)}
          </span>
        </div>
        <div className="absolute top-3 left-3 flex space-x-2 space-x-reverse">
          <button className="bg-white/80 hover:bg-white text-gray-700 p-1.5 rounded-full transition-colors">
            <Heart className="h-4 w-4" />
          </button>
          <button className="bg-white/80 hover:bg-white text-gray-700 p-1.5 rounded-full transition-colors">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Property Details */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {property.title}
          </h3>
          <span className="text-sm text-gray-500">
            {getPropertyTypeText(property.propertyType)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {property.description}
        </p>
        
        {/* Location */}
        {property.location && (
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="h-4 w-4 ml-1" />
            <span>{property.location}</span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            {property.price ? (
              <span className="text-xl font-bold text-blue-600">
                {property.price.toLocaleString()} جنيه
              </span>
            ) : (
              <span className="text-gray-500">السعر عند التواصل</span>
            )}
          </div>
          {property.area && (
            <span className="text-sm text-gray-500">
              {property.area} م²
            </span>
          )}
        </div>
        
        {/* Contact Info */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-2">
                <HomeIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {property.owner?.name || 'وسيط عقاري'}
                </p>
                {showPhone ? (
                  <p className="text-xs text-gray-500">
                    {property.owner?.phone || 'غير متوفر'}
                  </p>
                ) : (
                  <div className="flex items-center text-xs text-gray-500">
                    <Lock className="h-3 w-3 ml-1" />
                    <span>اشترك لرؤية الرقم</span>
                  </div>
                )}
              </div>
            </div>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              onClick={() => showPhone ? window.open(`tel:${property.owner?.phone}`) : onSubscriptionClick()}
            >
              {showPhone ? 'اتصل الآن' : 'اشترك للتواصل'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Public Home Component
export const PublicHome: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [popularProperties, setPopularProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const allProperties = await brokerApi.getProperties({ limit: 100 });
        
        setProperties(allProperties);
        setFilteredProperties(allProperties);
        
        // Get featured properties (first 6)
        setFeaturedProperties(allProperties.slice(0, 6));
        
        // Get popular properties (properties with higher view count or recent)
        const popular = allProperties
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(6, 12);
        setPopularProperties(popular);
        
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    let filtered = properties;
    
    // Filter by search term (title, description, location)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(property => 
        property.title?.toLowerCase().includes(searchLower) ||
        property.description?.toLowerCase().includes(searchLower) ||
        property.location?.toLowerCase().includes(searchLower) ||
        property.owner?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by listing type
    if (filters.listingType) {
      filtered = filtered.filter(property => property.listingType === filters.listingType);
    }
    
    // Filter by property type
    if (filters.propertyType) {
      filtered = filtered.filter(property => property.propertyType === filters.propertyType);
    }
    
    setFilteredProperties(filtered);
    setFeaturedProperties(filtered.slice(0, 6));
    
    // Scroll to results
    const resultsSection = document.getElementById('featured-properties');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <PublicHeader />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      {/* Hero Section */}
      <HeroSection properties={properties} onSearch={handleSearch} />
      
      {/* Featured Properties Section */}
      <section id="featured-properties" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              العقارات المميزة
              {filteredProperties.length !== properties.length && (
                <span className="text-blue-600 text-lg font-normal block mt-2">
                  {filteredProperties.length} نتيجة من أصل {properties.length}
                </span>
              )}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              اكتشف مجموعة مختارة من أفضل العقارات المتاحة في المنطقة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onSubscriptionClick={() => setIsSubscriptionModalOpen(true)}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                setFeaturedProperties(filteredProperties.slice(0, 20));
                const resultsSection = document.getElementById('featured-properties');
                if (resultsSection) {
                  resultsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              عرض المزيد من العقارات ({filteredProperties.length > 6 ? filteredProperties.length - 6 : 0})
            </button>
          </div>
        </div>
      </section>
      
      {/* Popular Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              الأكثر مشاهدة
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              العقارات التي تحظى بأكبر اهتمام من المشترين والمستأجرين
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onSubscriptionClick={() => setIsSubscriptionModalOpen(true)}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white p-2 rounded-lg ml-6">
                  <Building className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">اي ايجار</h3>
              </div>
              <p className="text-gray-400">
                منصة رائدة في مجال العقارات بمدينة العاشر من رمضان
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-right" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>عقارات للبيع</button></li>
                <li><button className="hover:text-white text-right" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>عقارات للإيجار</button></li>
                <li><button className="hover:text-white text-right" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>الوسطاء</button></li>
                <li><button className="hover:text-white text-right" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>خدماتنا</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">من نحن</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-right" onClick={() => alert('قريباً - صفحة عن الشركة')}>عن الشركة</button></li>
                <li><button className="hover:text-white text-right" onClick={() => alert('قريباً - صفحة فريق العمل')}>فريق العمل</button></li>
                <li><button className="hover:text-white text-right" onClick={() => alert('قريباً - شروط الاستخدام')}>شروط الاستخدام</button></li>
                <li><button className="hover:text-white text-right" onClick={() => alert('قريباً - سياسة الخصوصية')}>سياسة الخصوصية</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">تواصل معنا</h4>
              <div className="text-gray-400 space-y-2">
                <p>📧 info@aqarat-asher.com</p>
                <p>📱 للاشتراك والتفاصيل</p>
                <p>📍 العاشر من رمضان، مصر</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 اي ايجار. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
      
      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)} 
      />
    </div>
  );
};
