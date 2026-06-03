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

  return (
    <div className="relative rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        {process.system && (
          <SystemBadge
            name={process.system.name}
            color={process.system.color}
          />
        )}
        {session && (
          <button
            onClick={() => onFavoriteToggle(process.id, process.is_favorite)}
            className="shrink-0 text-warn transition-colors hover:text-warn/70"
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
      <Link to={`/processes/${process.id}`}>
        <h3 className="font-serif text-base font-semibold text-ink transition-colors hover:text-accent">
          {process.title}
        </h3>
      </Link>
      {process.category && (
        <p className="mt-1 text-sm text-muted">{process.category}</p>
      )}
      <p className="mt-3 text-xs text-muted">
        {process.step_count ?? 0}{' '}
        {process.step_count === 1 ? 'paso' : 'pasos'}
      </p>
    </div>
  )
}
