import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { BrokerDashboard } from './pages/BrokerDashboard';
import { Brokers } from './pages/Brokers';
import { Properties } from './pages/Properties';
import { Contacts } from './pages/Contacts';
import { PublicHome } from './pages/PublicHome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserDashboard } from './pages/UserDashboard';
import { Dashboard } from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/public" element={<PublicHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected CRM Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Protected User Dashboard */}
          <Route path="/user-dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          {/* Protected Admin Dashboard */}
          <Route path="/admin-panel" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin/Dashboard Routes */}
          <Route path="/admin/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<BrokerDashboard />} />
                <Route path="/dashboard" element={<BrokerDashboard />} />
                <Route path="/brokers" element={<Brokers />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/messages" element={<div className="p-8 text-center text-gray-500">Messages page coming soon...</div>} />
                <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Settings page coming soon...</div>} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
