import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProcesses } from '../hooks/useProcesses'
import { useSystems } from '../hooks/useSystems'
import { useAuth } from '../context/AuthContext'
import { ProcessCard } from '../components/ProcessCard'
import { Sidebar } from '../components/Sidebar'
import { Button } from '../components/ui/Button'

export function HomePage() {
  const { processes, loading, toggleFavorite, filter } = useProcesses()
  const { systems } = useSystems()
  const { isAdmin } = useAuth()

  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(
    null
  )
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const filtered = useMemo(
    () => filter(processes, selectedSystemId, search, showFavOnly),
    [processes, selectedSystemId, search, showFavOnly, filter]
  )

  const processCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    processes.forEach((p) => {
      counts[p.system_id] = (counts[p.system_id] ?? 0) + 1
    })
    return counts
  }, [processes])

  const handleSelectSystem = (id: string | null) => {
    setSelectedSystemId(id)
    setShowFavOnly(false)
  }

  const handleToggleFav = () => {
    setShowFavOnly((v) => !v)
    setSelectedSystemId(null)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        systems={systems}
        processCounts={processCounts}
        selectedSystemId={selectedSystemId}
        showFavOnly={showFavOnly}
        totalCount={processes.length}
        favoriteCount={processes.filter((p) => p.is_favorite).length}
        onSelectSystem={handleSelectSystem}
        onToggleFav={handleToggleFav}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 px-4 py-6 md:px-8">
        {/* Mobile header */}
        <div className="mb-4 flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-ink"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <span className="font-serif font-bold text-ink">
            Manual de Procesos
          </span>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            placeholder="Buscar procesos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-ink placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:max-w-xs"
          />
          {isAdmin && (
            <Link to="/processes/new">
              <Button>+ Nuevo proceso</Button>
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-muted">Cargando...</p>
        ) : filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2 text-center">
            <p className="text-4xl">📋</p>
            <p className="font-serif text-lg text-ink">Sin resultados</p>
            <p className="text-sm text-muted">
              {search
                ? 'Intenta con otro término de búsqueda.'
                : 'No hay procesos en esta categoría.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProcessCard
                key={p.id}
                process={p}
                onFavoriteToggle={toggleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
