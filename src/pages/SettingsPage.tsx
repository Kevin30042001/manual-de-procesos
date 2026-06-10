import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import toast from 'react-hot-toast'

export function SettingsPage() {
  const { user, fullName } = useAuth()

  const [name, setName] = useState(fullName ?? '')
  const [nameLoading, setNameLoading] = useState(false)

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({})

  const handleNameSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setNameLoading(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } })
    setNameLoading(false)
    if (error) { toast.error('No se pudo actualizar el nombre.'); return }
    toast.success('Nombre actualizado')
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!currentPwd) errs.currentPwd = 'Escribe tu contraseña actual.'
    if (newPwd.length < 6) errs.newPwd = 'Mínimo 6 caracteres.'
    if (newPwd !== confirmPwd) errs.confirmPwd = 'Las contraseñas no coinciden.'
    if (Object.keys(errs).length) { setPwdErrors(errs); return }

    setPwdLoading(true)
    setPwdErrors({})

    // Verificar contraseña actual
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: currentPwd,
    })
    if (signInErr) {
      setPwdLoading(false)
      setPwdErrors({ currentPwd: 'Contraseña actual incorrecta.' })
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setPwdLoading(false)
    if (error) { toast.error('No se pudo actualizar la contraseña.'); return }
    toast.success('Contraseña actualizada')
    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-lg px-4 py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
        >
          ← Volver
        </Link>

        <h1 className="mb-8 font-serif text-2xl font-bold text-ink">
          Configuración
        </h1>

        {/* Nombre */}
        <div className="mb-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-semibold text-ink">Nombre</h2>
          <form onSubmit={handleNameSave} className="flex flex-col gap-4">
            <Input
              label="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div>
              <Button type="submit" disabled={nameLoading}>
                {nameLoading ? 'Guardando...' : 'Guardar nombre'}
              </Button>
            </div>
          </form>
        </div>

        {/* Contraseña */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-semibold text-ink">Contraseña</h2>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <Input
              label="Contraseña actual"
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              error={pwdErrors.currentPwd}
              autoComplete="current-password"
            />
            <Input
              label="Nueva contraseña"
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              error={pwdErrors.newPwd}
              autoComplete="new-password"
            />
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              error={pwdErrors.confirmPwd}
              autoComplete="new-password"
            />
            <div>
              <Button type="submit" disabled={pwdLoading}>
                {pwdLoading ? 'Actualizando...' : 'Cambiar contraseña'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
