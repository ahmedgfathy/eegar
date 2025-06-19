import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { BrokerDashboard } from './pages/BrokerDashboard';
import { Brokers } from './pages/Brokers';
import { Properties } from './pages/Properties';
import './index.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<BrokerDashboard />} />
          <Route path="/brokers" element={<Brokers />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/messages" element={<div className="p-8 text-center text-gray-500">Messages page coming soon...</div>} />
          <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Settings page coming soon...</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
