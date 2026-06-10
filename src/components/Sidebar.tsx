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

function Ornament() {
  return (
    <div className="my-3 flex items-center justify-center gap-2 px-3">
      <span className="h-px flex-1 bg-border" />
      <span className="font-serif text-muted/60" aria-hidden>
        ❦
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
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
  const { signOut, user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const userLabel = user?.email?.split('@')[0] ?? 'usuario'

  const Item = ({
    active,
    onClick,
    children,
    accentColor,
  }: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
    accentColor?: string
  }) => (
    <button
      onClick={onClick}
      className={`relative flex w-full cursor-pointer items-center justify-between rounded-r-lg py-2 pl-4 pr-3 text-sm transition-all duration-200 ${
        active
          ? 'bg-accent-bg font-medium text-accent'
          : 'text-ink hover:bg-surface'
      }`}
    >
      {active && (
        <span
          className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r"
          style={{ backgroundColor: accentColor ?? 'var(--color-accent)' }}
        />
      )}
      {children}
    </button>
  )

  const content = (
    <nav className="flex h-full flex-col px-2 py-4">
      {/* Greeting */}
      <div className="px-3 pb-3">
        <p className="text-xs uppercase tracking-wider text-muted">
          Hola
        </p>
        <p className="font-serif text-base font-semibold capitalize text-ink">
          {userLabel}
        </p>
      </div>

      <Ornament />

      {/* Sections header */}
      <p className="px-3 pb-1 pt-2 font-serif text-xs font-semibold uppercase tracking-wider text-muted">
        Vistas
      </p>
      <Item
        active={!selectedSystemId && !showFavOnly}
        onClick={() => {
          onSelectSystem(null)
          onMobileClose()
        }}
      >
        <span>Todos</span>
        <span className="rounded-full bg-border/60 px-2 py-0.5 text-xs text-muted">
          {totalCount}
        </span>
      </Item>
      <Item
        active={showFavOnly}
        onClick={() => {
          onToggleFav()
          onMobileClose()
        }}
        accentColor="var(--color-warn)"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-warn">★</span> Favoritos
        </span>
        <span className="rounded-full bg-border/60 px-2 py-0.5 text-xs text-muted">
          {favoriteCount}
        </span>
      </Item>

      <Ornament />

      <p className="px-3 pb-1 pt-2 font-serif text-xs font-semibold uppercase tracking-wider text-muted">
        Sistemas
      </p>
      {systems.map((sys) => (
        <Item
          key={sys.id}
          active={selectedSystemId === sys.id && !showFavOnly}
          onClick={() => {
            onSelectSystem(sys.id)
            onMobileClose()
          }}
          accentColor={sys.color}
        >
          <span className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full ring-2 ring-offset-1 ring-offset-surface"
              style={{ backgroundColor: sys.color, '--tw-ring-color': sys.color + '40' } as React.CSSProperties}
            />
            {sys.name}
          </span>
          <span className="rounded-full bg-border/60 px-2 py-0.5 text-xs text-muted">
            {processCounts[sys.id] ?? 0}
          </span>
        </Item>
      ))}

      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
        {isAdmin && (
          <Link
            to="/systems"
            className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
            onClick={onMobileClose}
          >
            ⚙ Gestionar sistemas
          </Link>
        )}
        <button
          onClick={async () => {
            await signOut()
            navigate('/login')
          }}
          className="rounded-lg px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          ⏻ Cerrar sesión
        </button>
      </div>
    </nav>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="border-b border-border px-5 py-5">
          <h1 className="font-serif text-xl font-bold leading-tight text-ink">
            Manual de
            <br />
            <span className="italic text-accent">Procesos</span>
          </h1>
        </div>
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-surface shadow-xl">
            <div className="border-b border-border px-5 py-5">
              <h1 className="font-serif text-xl font-bold leading-tight text-ink">
                Manual de{' '}
                <span className="italic text-accent">Procesos</span>
              </h1>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
