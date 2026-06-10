import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useSteps } from '../hooks/useSteps'
import { Process } from '../types'
import { SystemBadge } from '../components/SystemBadge'
import { StepItem } from '../components/StepItem'
import { Button } from '../components/ui/Button'

export function ProcessDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { steps, loading: stepsLoading } = useSteps(id)
  const [process, setProcess] = useState<Process | null>(null)
  const [loading, setLoading] = useState(true)
  const [cloning, setCloning] = useState(false)

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

  const isOwner = !!user && (process?.created_by === user.id || isAdmin)

  const toggleFavorite = async () => {
    if (!process) return
    const next = !process.is_favorite
    setProcess((prev) => (prev ? { ...prev, is_favorite: next } : prev))
    await supabase.from('processes').update({ is_favorite: next }).eq('id', process.id)
  }

  const toggleShared = async () => {
    if (!process) return
    const next = !process.is_shared
    setProcess((prev) => (prev ? { ...prev, is_shared: next } : prev))
    await supabase.from('processes').update({ is_shared: next }).eq('id', process.id)
    toast.success(next ? 'Proceso compartido con todos' : 'Proceso privado nuevamente')
  }

  const handleDelete = async () => {
    if (!process) return
    if (!window.confirm(`¿Eliminar "${process.title}"? Esta acción no se puede deshacer.`)) return
    await supabase.from('processes').delete().eq('id', process.id)
    toast.success('Proceso eliminado')
    navigate('/')
  }

  const handleClone = async () => {
    if (!process || !user) return
    setCloning(true)

    const { data: newProcess, error } = await supabase
      .from('processes')
      .insert({
        system_id: process.system_id,
        title: `${process.title} (copia)`,
        category: process.category,
        tags: process.tags,
        is_favorite: false,
        is_shared: false,
        created_by: user.id,
      })
      .select()
      .single()

    if (error || !newProcess) {
      toast.error('No se pudo clonar el proceso.')
      setCloning(false)
      return
    }

    if (steps.length > 0) {
      const stepsToInsert = steps.map(({ id: _id, ...step }) => ({
        ...step,
        process_id: newProcess.id,
      }))
      await supabase.from('steps').insert(stepsToInsert)
    }

    setCloning(false)
    toast.success('Proceso clonado a tu cuenta')
    navigate(`/processes/${newProcess.id}`)
  }

  if (loading) return <div className="p-8 text-sm text-muted">Cargando...</div>
  if (!process) return <div className="p-8 text-sm text-muted">Proceso no encontrado.</div>

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver al manual
        </Link>

        {/* Header */}
        <div className="mb-3 flex items-center gap-3">
          {process.system && (
            <SystemBadge name={process.system.name} color={process.system.color} />
          )}
          {isOwner && (
            <button
              onClick={toggleFavorite}
              className={`text-2xl leading-none transition-all duration-200 hover:scale-125 ${
                process.is_favorite ? 'text-warn' : 'text-muted/40 hover:text-warn/70'
              }`}
              aria-label={process.is_favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              {process.is_favorite ? '★' : '☆'}
            </button>
          )}
          {process.is_shared && (
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              Compartido
            </span>
          )}
        </div>

        <h1 className="font-serif text-3xl font-bold leading-tight text-ink md:text-4xl">
          {process.title}
        </h1>
        {process.category && (
          <p className="mt-2 font-serif text-base italic text-muted">{process.category}</p>
        )}

        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="font-serif text-sm text-muted/60">❦</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Steps */}
        <div className="flex flex-col">
          {stepsLoading ? (
            <p className="text-sm text-muted">Cargando pasos...</p>
          ) : (
            steps.map((step, i) => (
              <StepItem key={step.id} step={step} index={i} isLast={i === steps.length - 1} />
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
                <span key={tag} className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
          {isOwner ? (
            <>
              <Link to={`/processes/${process.id}/edit`}>
                <Button variant="secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-4 w-4">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Editar
                </Button>
              </Link>
              <Button variant="secondary" onClick={toggleShared}>
                {process.is_shared ? '🔒 Hacer privado' : '🔗 Compartir'}
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Eliminar
              </Button>
            </>
          ) : (
            <Button onClick={handleClone} disabled={cloning}>
              {cloning ? 'Clonando...' : '⎘ Clonar a mi cuenta'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
