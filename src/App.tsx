import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { GlobalContextProviders } from '../components/_globalContextProviders'

// Import pages with proper default exports
import Login from "../pages/login";
import Register from "../pages/register";
import HomePage from "../pages/_index";
import ProfilePage from "../pages/profile.$userId";
import ProfileRedirectPage from "../pages/profile";
import SearchPage from "../pages/search";
import NotificationsPage from "../pages/notifications";
import AdminPage from "../pages/admin";
import SettingsPage from "../pages/settings";

// Import layout components
import { UserRoute, AdminRoute } from '../components/ProtectedRoute'
import { AppLayout } from '../components/AppLayout'

function App() {
  return (
    <GlobalContextProviders>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected user routes */}
          <Route path="/" element={
            <UserRoute>
              <AppLayout>
                <HomePage />
              </AppLayout>
            </UserRoute>
          } />
          
          <Route path="/profile" element={
            <UserRoute>
              <AppLayout>
                <ProfileRedirectPage />
              </AppLayout>
            </UserRoute>
          } />
          
          <Route path="/profile/:userId" element={
            <UserRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </UserRoute>
          } />
          
          <Route path="/search" element={
            <UserRoute>
              <AppLayout>
                <SearchPage />
              </AppLayout>
            </UserRoute>
          } />
          
          <Route path="/notifications" element={
            <UserRoute>
              <AppLayout>
                <NotificationsPage />
              </AppLayout>
            </UserRoute>
          } />
          
          <Route path="/settings" element={
            <UserRoute>
              <SettingsPage />
            </UserRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AppLayout>
                <AdminPage />
              </AppLayout>
            </AdminRoute>
          } />
        </Routes>
      </Router>
    </GlobalContextProviders>
  )
}

export default App