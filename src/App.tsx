import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { ProcessDetailPage } from './pages/ProcessDetailPage'
import { ProcessFormPage } from './pages/ProcessFormPage'
import { SystemsPage } from './pages/SystemsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
          <AdminRoute>
            <ProcessFormPage />
          </AdminRoute>
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
          <AdminRoute>
            <ProcessFormPage />
          </AdminRoute>
        }
      />
      <Route
        path="/systems"
        element={
          <AdminRoute>
            <SystemsPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
