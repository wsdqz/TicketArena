import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import EventDetails from '../pages/EventDetails';
import Bookings from '../pages/Bookings';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminEvents from '../pages/admin/Events';
import AdminBookings from '../pages/admin/Bookings';
import { useAuth } from '../hooks/useAuth';
import ResetPassword from '../components/auth/ResetPassword';
import NotFound from '../pages/errors/NotFound';
import ServerError from '../pages/errors/ServerError';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  return isAuthenticated && user?.role === 'admin' ? (
    children
  ) : (
    <Navigate to="/" />
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route
          path="bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="bookings" element={<AdminBookings />} />
      </Route>

      <Route path="/error" element={<ServerError />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 