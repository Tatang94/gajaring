
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SplashScreen from '../components/SplashScreen'

function App() {
  const [showSplash, setShowSplash] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<div>Welcome to GAJARING!</div>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
