import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useSystems } from '../hooks/useSystems'
import { System } from '../types'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'

export function SystemsPage() {
  const { systems, create, update, remove, countBySystem } = useSystems()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<System | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#5b7a99')
  const [nameError, setNameError] = useState('')

  const openCreate = () => {
    setEditing(null)
    setName('')
    setColor('#5b7a99')
    setNameError('')
    setModalOpen(true)
  }

  const openEdit = (sys: System) => {
    setEditing(sys)
    setName(sys.name)
    setColor(sys.color)
    setNameError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('El nombre es obligatorio.')
      return
    }
    if (editing) {
      await update(editing.id, name.trim(), color)
      toast.success('Sistema actualizado')
    } else {
      await create(name.trim(), color)
      toast.success('Sistema creado')
    }
    setModalOpen(false)
  }

  const handleDelete = async (sys: System) => {
    const count = await countBySystem(sys.id)
    const msg =
      count > 0
        ? `"${sys.name}" tiene ${count} proceso${count !== 1 ? 's' : ''} asociado${count !== 1 ? 's' : ''}. ¿Eliminar de todas formas?`
        : `¿Eliminar el sistema "${sys.name}"?`
    if (!window.confirm(msg)) return
    await remove(sys.id)
    toast.success('Sistema eliminado')
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
        >
          ← Volver
        </Link>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-ink">
            Gestión de sistemas
          </h1>
          <Button onClick={openCreate}>+ Agregar</Button>
        </div>

        <div className="flex flex-col gap-3">
          {systems.map((sys) => (
            <div
              key={sys.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: sys.color }}
                />
                <span className="font-sans font-medium text-ink">
                  {sys.name}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEdit(sys)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(sys)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? 'Editar sistema' : 'Nuevo sistema'}
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
              autoFocus
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-ink">
                Color de etiqueta
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-16 cursor-pointer rounded border border-border bg-surface"
                />
                <span className="font-mono text-sm text-muted">{color}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave}>
                {editing ? 'Guardar' : 'Crear'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
