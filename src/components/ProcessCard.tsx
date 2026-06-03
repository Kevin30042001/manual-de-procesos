import { Link } from 'react-router-dom'
import { Process } from '../types'
import { SystemBadge } from './SystemBadge'
import { useAuth } from '../context/AuthContext'

interface Props {
  process: Process
  onFavoriteToggle: (id: string, current: boolean) => void
}

export function ProcessCard({ process, onFavoriteToggle }: Props) {
  const { session } = useAuth()
  const sysColor = process.system?.color ?? '#8b8377'

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ borderLeft: `5px solid ${sysColor}` }}
    >
      <div className="p-5 pl-6">
        <div className="mb-3 flex items-start justify-between gap-2">
          {process.system && (
            <SystemBadge
              name={process.system.name}
              color={process.system.color}
            />
          )}
          {session && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onFavoriteToggle(process.id, process.is_favorite)
              }}
              className={`shrink-0 text-xl leading-none transition-all duration-200 hover:scale-125 ${
                process.is_favorite
                  ? 'text-warn'
                  : 'text-muted/40 hover:text-warn/70'
              }`}
              aria-label={
                process.is_favorite
                  ? 'Quitar de favoritos'
                  : 'Agregar a favoritos'
              }
            >
              {process.is_favorite ? '★' : '☆'}
            </button>
          )}
        </div>
        <Link to={`/processes/${process.id}`} className="block">
          <h3 className="font-serif text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
            {process.title}
          </h3>
          {process.category && (
            <p className="mt-1.5 font-serif text-sm italic text-muted">
              {process.category}
            </p>
          )}
        </Link>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <span>
            {process.step_count ?? 0}{' '}
            {process.step_count === 1 ? 'paso' : 'pasos'}
          </span>
        </div>
      </div>
    </div>
  )
}
