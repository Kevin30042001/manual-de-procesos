import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProcesses } from '../hooks/useProcesses'
import { useSystems } from '../hooks/useSystems'
import { ProcessCard } from '../components/ProcessCard'
import { Sidebar } from '../components/Sidebar'
import { Button } from '../components/ui/Button'

function EmptyIllustration() {
  return (
    <svg
      viewBox="0 0 200 160"
      className="h-32 w-32 text-muted/40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M40 30 L40 130 Q40 140 50 140 L150 140 Q160 140 160 130 L160 30 Q160 20 150 20 L50 20 Q40 20 40 30 Z" />
      <line x1="100" y1="25" x2="100" y2="138" />
      <line x1="55" y1="50" x2="90" y2="50" />
      <line x1="55" y1="65" x2="90" y2="65" />
      <line x1="55" y1="80" x2="85" y2="80" />
      <line x1="110" y1="50" x2="145" y2="50" />
      <line x1="110" y1="65" x2="145" y2="65" />
      <line x1="110" y1="80" x2="140" y2="80" />
      <circle cx="100" cy="115" r="3" fill="currentColor" />
    </svg>
  )
}

export function HomePage() {
  const { processes, loading, toggleFavorite, filter } = useProcesses()
  const { systems } = useSystems()

  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null)
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [showSharedOnly, setShowSharedOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const filtered = useMemo(
    () => filter(processes, selectedSystemId, search, showFavOnly, showSharedOnly),
    [processes, selectedSystemId, search, showFavOnly, showSharedOnly, filter]
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
    setShowSharedOnly(false)
  }

  const handleToggleFav = () => {
    setShowFavOnly((v) => !v)
    setShowSharedOnly(false)
    setSelectedSystemId(null)
  }

  const handleToggleShared = () => {
    setShowSharedOnly((v) => !v)
    setShowFavOnly(false)
    setSelectedSystemId(null)
  }

  const activeSystemName = selectedSystemId
    ? systems.find((s) => s.id === selectedSystemId)?.name
    : null

  const pageTitle = showFavOnly
    ? 'Favoritos'
    : showSharedOnly
      ? 'Compartidos'
      : activeSystemName ?? 'Todos los procesos'

  const pageSubtitle = showFavOnly
    ? 'Tus procesos marcados'
    : showSharedOnly
      ? 'Procesos compartidos por el equipo'
      : activeSystemName
        ? `Procesos de ${activeSystemName}`
        : 'Manual completo de operaciones'

  return (
    <div className="flex min-h-screen">
      <Sidebar
        systems={systems}
        processCounts={processCounts}
        selectedSystemId={selectedSystemId}
        showFavOnly={showFavOnly}
        showSharedOnly={showSharedOnly}
        totalCount={processes.length}
        favoriteCount={processes.filter((p) => p.is_favorite).length}
        sharedCount={processes.filter((p) => p.is_shared).length}
        onSelectSystem={handleSelectSystem}
        onToggleFav={handleToggleFav}
        onToggleShared={handleToggleShared}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
        {/* Mobile header */}
        <div className="mb-6 flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-border bg-surface p-2 text-ink shadow-sm"
            aria-label="Abrir menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="font-serif text-lg font-bold text-ink">
            Manual de <span className="italic text-accent">Procesos</span>
          </span>
        </div>

        {/* Page header */}
        <div className="mb-6">
          <h2 className="font-serif text-3xl font-bold leading-tight text-ink md:text-4xl">
            {pageTitle}
          </h2>
          <p className="mt-1 font-serif text-sm italic text-muted">
            {pageSubtitle}
          </p>
        </div>

        {/* Search + new */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Buscar por título, categoría o etiqueta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-ink placeholder-muted shadow-sm transition-shadow focus:border-accent focus:shadow-md focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <Link to="/processes/new">
            <Button>
              <span className="mr-1.5 text-lg leading-none">+</span> Nuevo
              proceso
            </Button>
          </Link>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-sm text-muted">Cargando...</p>
        ) : filtered.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <EmptyIllustration />
            <p className="font-serif text-xl font-semibold text-ink">
              Sin resultados
            </p>
            <p className="max-w-xs font-serif text-sm italic text-muted">
              {search
                ? 'Intenta con otro término de búsqueda.'
                : 'No hay procesos en esta categoría todavía.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
