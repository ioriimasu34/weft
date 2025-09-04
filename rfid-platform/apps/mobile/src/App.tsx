import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RFIDProvider } from './contexts/RFIDContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Scanner from './pages/Scanner'
import Settings from './pages/Settings'
import Login from './pages/Login'

function App() {
  return (
    <AuthProvider>
      <RFIDProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="scanner" element={<Scanner />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </RFIDProvider>
    </AuthProvider>
  )
}

export default App
