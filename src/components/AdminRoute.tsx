import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted">
        Cargando...
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}
