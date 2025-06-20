import React, { useState } from 'react';
import { Bell, Search, User, Menu, X, Settings, LogOut, Home } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen = false }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-container">
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn lg:hidden"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <div className="logo-section">
            <div className="logo-icon">
              <Home className="h-6 w-6" />
            </div>
            <div className="logo-text">
              <h1 className="logo-title">CRM العقاري</h1>
              <p className="logo-subtitle hidden sm:block">نظام إدارة العملاء</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className={`search-container ${isSearchFocused ? 'search-focused' : ''}`}>
            <div className="search-wrapper">
              <div className="search-icon">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="البحث في العملاء والعقارات..."
                dir="rtl"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <div className="search-shortcuts hidden md:flex">
                <kbd className="search-kbd">Ctrl</kbd>
                <kbd className="search-kbd">K</kbd>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="header-actions">
            {/* Notifications */}
            <div className="notification-wrapper">
              <button className="notification-btn" aria-label="الإشعارات">
                <Bell className="h-5 w-5" />
                <span className="notification-badge">3</span>
              </button>
            </div>

            {/* User Profile */}
            <div className="user-profile-wrapper">
              <button 
                className={`user-profile ${isProfileMenuOpen ? 'user-profile-active' : ''}`}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-label="ملف المستخدم"
              >
                <div className="user-avatar">
                  <div className="user-avatar-text">أح</div>
                  <div className="user-status-indicator"></div>
                </div>
                <div className="user-info hidden md:block">
                  <span className="user-name">أحمد جمعة</span>
                  <span className="user-role">مدير النظام</span>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="user-avatar-large">
                      <div className="user-avatar-text">أح</div>
                    </div>
                    <div className="user-details">
                      <h3 className="user-name-large">أحمد جمعة</h3>
                      <p className="user-email">ahmed@example.com</p>
                    </div>
                  </div>
                  
                  <div className="profile-dropdown-divider"></div>
                  
                  <div className="profile-dropdown-menu">
                    <button className="profile-menu-item">
                      <Settings className="h-4 w-4" />
                      الإعدادات
                    </button>
                    <button className="profile-menu-item text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <div className="mobile-search-overlay lg:hidden">
        <div className="mobile-search-container">
          <div className="mobile-search-wrapper">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث..."
              className="mobile-search-input"
              dir="rtl"
            />
          </div>
        </div>
      </div>
    </header>
  );
};