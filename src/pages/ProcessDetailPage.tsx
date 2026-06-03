import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useSteps } from '../hooks/useSteps'
import { useAuth } from '../context/AuthContext'
import { Process } from '../types'
import { SystemBadge } from '../components/SystemBadge'
import { StepItem } from '../components/StepItem'
import { Button } from '../components/ui/Button'

export function ProcessDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { steps, loading: stepsLoading } = useSteps(id)
  const [process, setProcess] = useState<Process | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase
      .from('processes')
      .select('*, system:systems(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setProcess(data)
        setLoading(false)
      })
  }, [id])

  const toggleFavorite = async () => {
    if (!process) return
    const next = !process.is_favorite
    setProcess((prev) => (prev ? { ...prev, is_favorite: next } : prev))
    await supabase
      .from('processes')
      .update({ is_favorite: next })
      .eq('id', process.id)
  }

  const handleDelete = async () => {
    if (!process) return
    if (
      !window.confirm(
        `¿Eliminar "${process.title}"? Esta acción no se puede deshacer.`
      )
    )
      return
    await supabase.from('processes').delete().eq('id', process.id)
    toast.success('Proceso eliminado')
    navigate('/')
  }

  if (loading)
    return <div className="p-8 text-sm text-muted">Cargando...</div>
  if (!process)
    return (
      <div className="p-8 text-sm text-muted">Proceso no encontrado.</div>
    )

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
        >
          ← Volver
        </Link>

        <div className="mb-2 flex items-center gap-3">
          {process.system && (
            <SystemBadge
              name={process.system.name}
              color={process.system.color}
            />
          )}
          <button
            onClick={toggleFavorite}
            className="text-lg text-warn transition-colors hover:text-warn/70"
            aria-label={
              process.is_favorite
                ? 'Quitar de favoritos'
                : 'Agregar a favoritos'
            }
          >
            {process.is_favorite ? '★' : '☆'}
          </button>
        </div>

        <h1 className="font-serif text-2xl font-bold text-ink">
          {process.title}
        </h1>
        {process.category && (
          <p className="mt-1 text-sm text-muted">{process.category}</p>
        )}

        <hr className="my-6 border-border" />

        <div className="flex flex-col">
          {stepsLoading ? (
            <p className="text-sm text-muted">Cargando pasos...</p>
          ) : (
            steps.map((step, i) => (
              <StepItem key={step.id} step={step} index={i} />
            ))
          )}
        </div>

        {process.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {process.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {isAdmin && (
          <div className="mt-8 flex gap-3">
            <Link to={`/processes/${process.id}/edit`}>
              <Button variant="secondary">Editar</Button>
            </Link>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
