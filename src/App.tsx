import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { ProcessDetailPage } from './pages/ProcessDetailPage'
import { ProcessFormPage } from './pages/ProcessFormPage'
import { SystemsPage } from './pages/SystemsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/processes/new"
        element={
          <ProtectedRoute>
            <ProcessFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/processes/:id"
        element={
          <ProtectedRoute>
            <ProcessDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/processes/:id/edit"
        element={
          <ProtectedRoute>
            <ProcessFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/systems"
        element={
          <ProtectedRoute>
            <SystemsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
