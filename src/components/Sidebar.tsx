import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building, 
  MessageSquare, 
  BarChart3,
  Upload,
  UserCheck
} from 'lucide-react';

const navigation = [
  { name: 'لوحة التحكم', href: '/admin/', icon: Home },
  { name: 'السماسرة', href: '/admin/brokers', icon: Users },
  { name: 'العقارات', href: '/admin/properties', icon: Building },
  { name: 'جهات الاتصال', href: '/admin/contacts', icon: UserCheck },
  { name: 'الرسائل', href: '/admin/messages', icon: MessageSquare },
  { name: 'التقارير', href: '/admin/reports', icon: BarChart3 },
  { name: 'استيراد البيانات', href: '/admin/import', icon: Upload },
];

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen = false, onClose }) => {
  const location = useLocation();

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`sidebar-container ${isMobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
      <div className="sidebar">
        <div className="sidebar-content">
          <nav className="nav">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <item.icon className="nav-icon" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};