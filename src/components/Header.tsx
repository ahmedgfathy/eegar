import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-container">
          {/* Logo */}
          <div className="logo-section">
            <h1 className="logo">Real Estate CRM</h1>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <div className="search-wrapper">
              <div className="search-icon">
                <Search />
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Search contacts, properties..."
              />
            </div>
          </div>

          {/* Right side */}
          <div className="header-actions">
            {/* Notifications */}
            <button className="notification-btn">
              <Bell />
            </button>

            {/* User Profile */}
            <div className="user-profile">
              <div className="user-avatar">
                <User />
              </div>
              <span className="user-name">Ahmed Gomaa</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};