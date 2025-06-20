import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Eye, 
  Heart,
  ChevronLeft,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center">
          <div className="bg-yellow-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Crown className="h-10 w-10 text-yellow-600" />
          </div>
          
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            اشترك للوصول لتفاصيل التواصل
          </h3>
          
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            احصل على وصول كامل لأرقام الوسطاء وتفاصيل التواصل مع أصحاب العقارات
          </p>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-semibold">باقة شهرية</span>
              <span className="text-3xl font-bold text-blue-600">99 جنيه</span>
            </div>
            <ul className="text-gray-600 space-y-3">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 ml-3" />
                وصول لجميع أرقام الوسطاء
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 ml-3" />
                تفاصيل تواصل أصحاب العقارات
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 ml-3" />
                إشعارات العقارات الجديدة
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 ml-3" />
                دعم فني على مدار الساعة
              </li>
            </ul>
          </div>
          
          <button className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg mb-4">
            اشترك الآن
          </button>
          
          <p className="text-sm text-gray-500">
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
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-4 rounded-xl ml-10">
              <Building className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">اي ايجار</h1>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-20 space-x-reverse">
            <a href="#home" className="text-blue-600 font-semibold hover:text-blue-700 px-4 py-3 text-lg">الرئيسية</a>
            <a href="#sale" className="text-gray-700 hover:text-blue-600 px-4 py-3 text-lg">للبيع</a>
            <a href="#rent" className="text-gray-700 hover:text-blue-600 px-4 py-3 text-lg">للإيجار</a>
            <a href="#agents" className="text-gray-700 hover:text-blue-600 px-4 py-3 text-lg">الوسطاء</a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 px-4 py-3 text-lg">من نحن</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 px-4 py-3 text-lg">تواصل معنا</a>
          </nav>
          
          {/* Login Button */}
          <button 
            className="bg-blue-600 text-white px-10 py-4 rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold"
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
    <div className="relative h-[600px] md:h-[700px] overflow-hidden">
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
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      )}
      
      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-8 max-w-7xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-16 leading-tight">
            اكتشف منزل أحلامك
          </h1>
          <p className="text-3xl md:text-4xl mb-20 opacity-90 leading-relaxed">
            آلاف العقارات المميزة في العاشر من رمضان وما حولها
          </p>
          
          {/* Search Filter Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 max-w-7xl mx-auto shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <input
                  type="text"
                  placeholder="ابحث بالمنطقة أو رقم الوسيط..."
                  className="w-full pr-14 pl-8 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir="rtl"
                />
              </div>
              
              {/* Listing Type */}
              <select
                className="w-full px-8 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-lg"
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
                className="w-full px-8 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-lg"
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
                className="bg-blue-600 text-white px-10 py-5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center text-lg font-semibold"
                onClick={handleSearch}
              >
                <Search className="h-6 w-6 ml-3" />
                بحث
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slide Indicators */}
      {heroProperties.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 space-x-reverse">
          {heroProperties.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full transition-all ${
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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Property Image */}
      <div className="relative h-56">
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-2 rounded-full text-sm font-medium ${getListingTypeColor(property.listingType)}`}>
            {getListingTypeText(property.listingType)}
          </span>
        </div>
        <div className="absolute top-4 left-4 flex space-x-3 space-x-reverse">
          <button className="bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full transition-colors">
            <Heart className="h-5 w-5" />
          </button>
          <button className="bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full transition-colors">
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Property Details */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 truncate">
            {property.title}
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {getPropertyTypeText(property.propertyType)}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {property.description}
        </p>
        
        {/* Location */}
        {property.location && (
          <div className="flex items-center text-gray-500 mb-4">
            <MapPin className="h-5 w-5 ml-2" />
            <span className="text-lg">{property.location}</span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {property.price ? (
              <span className="text-2xl font-bold text-blue-600">
                {property.price.toLocaleString()} جنيه
              </span>
            ) : (
              <span className="text-gray-500 text-lg">السعر عند التواصل</span>
            )}
          </div>
          {property.area && (
            <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {property.area} م²
            </span>
          )}
        </div>
        
        {/* Contact Info */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                <HomeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-lg">
                  {property.owner?.name || 'وسيط عقاري'}
                </p>
                {showPhone ? (
                  <p className="text-gray-500">
                    {property.owner?.phone || 'غير متوفر'}
                  </p>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <Lock className="h-4 w-4 ml-1" />
                    <span>اشترك لرؤية الرقم</span>
                  </div>
                )}
              </div>
            </div>
            <button 
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
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
      <section id="featured-properties" className="py-24 bg-white">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              العقارات المميزة
              {filteredProperties.length !== properties.length && (
                <span className="text-blue-600 text-2xl font-normal block mt-4">
                  {filteredProperties.length} نتيجة من أصل {properties.length}
                </span>
              )}
            </h2>
            <p className="text-gray-600 text-2xl max-w-3xl mx-auto leading-relaxed">
              اكتشف مجموعة مختارة من أفضل العقارات المتاحة في المنطقة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onSubscriptionClick={() => setIsSubscriptionModalOpen(true)}
              />
            ))}
          </div>
          
          <div className="text-center mt-16">
            <button 
              className="bg-blue-600 text-white px-12 py-4 rounded-xl hover:bg-blue-700 transition-colors text-xl font-semibold"
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
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              الأكثر مشاهدة
            </h2>
            <p className="text-gray-600 text-2xl max-w-3xl mx-auto leading-relaxed">
              العقارات التي تحظى بأكبر اهتمام من المشترين والمستأجرين
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 text-white p-4 rounded-xl ml-8">
                  <Building className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold">اي ايجار</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                منصة رائدة في مجال العقارات بمدينة العاشر من رمضان
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-6">روابط سريعة</h4>
              <ul className="space-y-4 text-gray-400">
                <li><button className="hover:text-white text-right text-lg" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>عقارات للبيع</button></li>
                <li><button className="hover:text-white text-right text-lg" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>عقارات للإيجار</button></li>
                <li><button className="hover:text-white text-right text-lg" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>الوسطاء</button></li>
                <li><button className="hover:text-white text-right text-lg" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>خدماتنا</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-6">من نحن</h4>
              <ul className="space-y-4 text-gray-400">
                <li><button className="hover:text-white text-right text-lg" onClick={() => alert('قريباً - صفحة عن الشركة')}>عن الشركة</button></li>
                <li><button className="hover:text-white text-right text-lg" onClick={() => alert('قريباً - صفحة فريق العمل')}>فريق العمل</button></li>
                <li><button className="hover:text-white text-right text-lg" onClick={() => alert('قريباً - شروط الاستخدام')}>شروط الاستخدام</button></li>
                <li><button className="hover:text-white text-right text-lg" onClick={() => alert('قريباً - سياسة الخصوصية')}>سياسة الخصوصية</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-6">تواصل معنا</h4>
              <div className="text-gray-400 space-y-4 text-lg">
                <p>📧 info@aqarat-asher.com</p>
                <p>📱 للاشتراك والتفاصيل</p>
                <p>📍 العاشر من رمضان، مصر</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-12 text-center text-gray-400">
            <p className="text-lg">&copy; 2025 اي ايجار. جميع الحقوق محفوظة.</p>
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
