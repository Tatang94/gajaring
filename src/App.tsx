import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { GlobalContextProviders } from '../components/_globalContextProviders'
import { Login } from "../pages/login";
import { Register } from "../pages/register";
import { Notifications } from "../pages/notifications";
import { Admin } from "../pages/admin";
import { Search } from "../pages/search";
import { Settings } from "../pages/settings";
import { ProfileUserId } from "../pages/profile.$userId";
import { Profile } from "../pages/profile";
import LoginPage from '../pages/login'
import { UserRoute } from '../components/ProtectedRoute'

function App() {
  return (
    <GlobalContextProviders>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <UserRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Welcome to GAJARING!</h1>
                <p>You are successfully logged in.</p>
              </div>
            </UserRoute>
          } />
        </Routes>
      </Router>
    </GlobalContextProviders>
  )
}

export default App