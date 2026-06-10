import { useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { useShares } from '../hooks/useShares'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

interface Props {
  open: boolean
  onClose: () => void
  processId: string
  processTitle: string
  isSharedPublic: boolean
  onTogglePublic: () => void
}

export function ShareModal({ open, onClose, processId, processTitle, isSharedPublic, onTogglePublic }: Props) {
  const { user } = useAuth()
  const { shares, allProfiles, loading, addShare, removeShare } = useShares(open ? processId : undefined)
  const [search, setSearch] = useState('')

  const sharedWithIds = new Set(shares.map((s) => s.shared_with))

  const available = allProfiles.filter((p) => {
    if (p.id === user?.id) return false          // no mostrarse a sí mismo
    if (sharedWithIds.has(p.id)) return false    // ya tiene acceso
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (p.full_name ?? '').toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.puesto ?? '').toLowerCase().includes(q)
    )
  })

  const handleAdd = async (profileId: string) => {
    if (!user) return
    await addShare(processId, profileId, user.id)
    toast.success('Acceso otorgado')
  }

  const handleRemove = async (shareId: string, name: string) => {
    await removeShare(shareId)
    toast.success(`Acceso revocado para ${name}`)
  }

  return (
    <Modal open={open} onClose={onClose} title={`Compartir — ${processTitle}`}>
      <div className="flex flex-col gap-5">

        {/* Opción: compartir con todos */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">Visible para todos</p>
            <p className="text-xs text-muted">Cualquier usuario del sistema puede verlo</p>
          </div>
          <button
            onClick={onTogglePublic}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
              isSharedPublic ? 'bg-accent' : 'bg-border'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                isSharedPublic ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Accesos individuales actuales */}
        {shares.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Con acceso individual
            </p>
            <div className="flex flex-col gap-2">
              {shares.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {s.profile.full_name ?? s.profile.email}
                    </p>
                    {s.profile.puesto && (
                      <p className="text-xs text-muted">{s.profile.puesto}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(s.id, s.profile.full_name ?? s.profile.email)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Revocar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agregar persona */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Agregar persona
          </p>
          <input
            type="search"
            placeholder="Buscar por nombre, correo o puesto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {loading ? (
            <p className="text-xs text-muted">Cargando usuarios...</p>
          ) : available.length === 0 ? (
            <p className="text-xs italic text-muted">
              {search ? 'Sin resultados.' : 'Todos los usuarios ya tienen acceso.'}
            </p>
          ) : (
            <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto">
              {available.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {p.full_name ?? p.email}
                    </p>
                    <p className="text-xs text-muted">
                      {p.puesto ? `${p.puesto} · ` : ''}{p.email}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleAdd(p.id)}>
                    Dar acceso
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border pt-3">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Modal>
  )
}
