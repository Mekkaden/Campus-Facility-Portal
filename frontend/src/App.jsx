import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SubmissionFlow from './pages/SubmissionFlow';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintDetail from './pages/ComplaintDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/submit" element={<SubmissionFlow />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/complaints/:id" element={<ComplaintDetail />} />
    </Routes>
  );
}
