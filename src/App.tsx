import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import './index.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/properties" element={<div className="p-8 text-center text-gray-500">Properties page coming soon...</div>} />
          <Route path="/messages" element={<div className="p-8 text-center text-gray-500">Messages page coming soon...</div>} />
          <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Settings page coming soon...</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
