import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building, 
  MessageSquare, 
  BarChart3,
  Upload
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Properties', href: '/properties', icon: Building },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Import Data', href: '/import', icon: Upload },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div style={{ display: 'none' }} className="sidebar-container">
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