import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { BookingPage } from './pages/BookingPage';
import { DriverDashboard } from './pages/DriverDashboard';
import { BusinessDashboard } from './pages/BusinessDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { TripsPage } from './pages/TripsPage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/business" element={<BusinessDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
