import { Link, useNavigate } from 'react-router-dom'
import { System } from '../types'
import { useAuth } from '../context/AuthContext'

interface Props {
  systems: System[]
  processCounts: Record<string, number>
  selectedSystemId: string | null
  showFavOnly: boolean
  totalCount: number
  favoriteCount: number
  onSelectSystem: (id: string | null) => void
  onToggleFav: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({
  systems,
  processCounts,
  selectedSystemId,
  showFavOnly,
  totalCount,
  favoriteCount,
  onSelectSystem,
  onToggleFav,
  mobileOpen,
  onMobileClose,
}: Props) {
  const { isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const itemClass = (active: boolean) =>
    `flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
      active
        ? 'bg-accent-bg text-accent font-medium'
        : 'text-ink hover:bg-surface'
    }`

  const content = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <p className="mb-2 px-3 font-serif text-xs font-semibold uppercase tracking-wider text-muted">
        Sistemas
      </p>
      <button
        className={itemClass(!selectedSystemId && !showFavOnly)}
        onClick={() => {
          onSelectSystem(null)
          onMobileClose()
        }}
      >
        <span>Todos</span>
        <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted">
          {totalCount}
        </span>
      </button>
      <button
        className={itemClass(showFavOnly)}
        onClick={() => {
          onToggleFav()
          onMobileClose()
        }}
      >
        <span>★ Favoritos</span>
        <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted">
          {favoriteCount}
        </span>
      </button>
      <hr className="my-2 border-border" />
      {systems.map((sys) => (
        <button
          key={sys.id}
          className={itemClass(
            selectedSystemId === sys.id && !showFavOnly
          )}
          onClick={() => {
            onSelectSystem(sys.id)
            onMobileClose()
          }}
        >
          <span className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: sys.color }}
            />
            {sys.name}
          </span>
          <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted">
            {processCounts[sys.id] ?? 0}
          </span>
        </button>
      ))}

      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
        {isAdmin && (
          <Link
            to="/systems"
            className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
            onClick={onMobileClose}
          >
            Gestionar sistemas
          </Link>
        )}
        <button
          onClick={async () => {
            await signOut()
            navigate('/login')
          }}
          className="rounded-lg px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="border-b border-border p-4">
          <h1 className="font-serif text-lg font-bold text-ink">
            Manual de
            <br />
            Procesos
          </h1>
        </div>
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-surface shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
