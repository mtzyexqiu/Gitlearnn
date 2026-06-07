import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ServiceDetail from './pages/ServiceDetail';
import ChatPage from './pages/ChatPage';
import MessagesPage from './pages/MessagesPage';
import PricingPage from './pages/PricingPage';
import MyOrders from './pages/MyOrders';
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';
import CheckoutPage from './pages/CheckoutPage'; // Komponen yang tadi kita buat
import OrderFilesPage from './pages/OrderFilesPage';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/checkout/:plan" element={<CheckoutPage />} />

      {/* Client Protected Routes */}
      <Route path="/client/dashboard" element={
        <ProtectedRoute role="CLIENT"><ClientDashboard /></ProtectedRoute>
      } />
      <Route path="/my-orders" element={
        <ProtectedRoute role="CLIENT"><MyOrders /></ProtectedRoute>
      } />

      {/* Freelancer Protected Routes */}
      <Route path="/freelancer/dashboard" element={
        <ProtectedRoute role="FREELANCER"><FreelancerDashboard /></ProtectedRoute>
      } />

      {/* Shared Protected Routes */}
      <Route path="/service/:id" element={
        <ProtectedRoute><ServiceDetail /></ProtectedRoute>
      } />
      <Route path="/chat/:receiverId" element={
        <ProtectedRoute><ChatPage /></ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute><MessagesPage /></ProtectedRoute>
      } />
      <Route path="/edit-profile" element={
        <ProtectedRoute><EditProfile /></ProtectedRoute>
      } />
      <Route path="/profile/:id" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />
      <Route path="/order-files/:orderId" element={
        <ProtectedRoute><OrderFilesPage /></ProtectedRoute>
      } />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;