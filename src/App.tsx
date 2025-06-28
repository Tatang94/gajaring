
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { GlobalContextProviders } from '../components/_globalContextProviders'
import LoginPage from '../pages/login'
import { UserRoute } from '../components/ProtectedRoute'

function App() {
  return (
    <GlobalContextProviders>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
