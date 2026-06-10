import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useSteps } from '../hooks/useSteps'
import { Process } from '../types'
import { SystemBadge } from '../components/SystemBadge'
import { StepItem } from '../components/StepItem'
import { Button } from '../components/ui/Button'

export function ProcessDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver al manual
        </Link>

        {/* Header */}
        <div className="mb-3 flex items-center gap-3">
          {process.system && (
            <SystemBadge
              name={process.system.name}
              color={process.system.color}
            />
          )}
          <button
            onClick={toggleFavorite}
            className={`text-2xl leading-none transition-all duration-200 hover:scale-125 ${
              process.is_favorite ? 'text-warn' : 'text-muted/40 hover:text-warn/70'
            }`}
            aria-label={
              process.is_favorite
                ? 'Quitar de favoritos'
                : 'Agregar a favoritos'
            }
          >
            {process.is_favorite ? '★' : '☆'}
          </button>
        </div>

        <h1 className="font-serif text-3xl font-bold leading-tight text-ink md:text-4xl">
          {process.title}
        </h1>
        {process.category && (
          <p className="mt-2 font-serif text-base italic text-muted">
            {process.category}
          </p>
        )}

        {/* Ornamental divider */}
        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="font-serif text-sm text-muted/60">❦</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Steps timeline */}
        <div className="flex flex-col">
          {stepsLoading ? (
            <p className="text-sm text-muted">Cargando pasos...</p>
          ) : (
            steps.map((step, i) => (
              <StepItem
                key={step.id}
                step={step}
                index={i}
                isLast={i === steps.length - 1}
              />
            ))
          )}
        </div>

        {/* Tags */}
        {process.tags.length > 0 && (
          <div className="mt-8 border-t border-border pt-6">
            <p className="mb-3 font-serif text-xs font-semibold uppercase tracking-wider text-muted">
              Etiquetas
            </p>
            <div className="flex flex-wrap gap-2">
              {process.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
          <Link to={`/processes/${process.id}/edit`}>
            <Button variant="secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1.5 h-4 w-4"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Editar
            </Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}
