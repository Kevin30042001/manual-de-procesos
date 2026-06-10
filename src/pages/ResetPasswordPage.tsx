import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase emite PASSWORD_RECOVERY cuando el usuario llega con el token del correo
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (password.length < 6) errs.password = 'Mínimo 6 caracteres.'
    if (password !== confirm) errs.confirm = 'Las contraseñas no coinciden.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setErrors({ form: 'No se pudo actualizar la contraseña. Intenta de nuevo.' })
      return
    }
    setDone(true)
    setTimeout(() => navigate('/'), 2000)
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <p className="font-serif text-muted italic">Validando enlace...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-md md:p-10">
          {done ? (
            <div className="text-center">
              <h1 className="font-serif text-2xl font-bold text-ink">¡Contraseña actualizada!</h1>
              <p className="mt-3 text-sm text-muted">Redirigiendo al inicio...</p>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="font-serif text-3xl font-bold leading-tight text-ink">
                  Nueva <span className="italic text-accent">contraseña</span>
                </h1>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Nueva contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  autoComplete="new-password"
                />
                <Input
                  label="Confirmar contraseña"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  error={errors.confirm}
                  autoComplete="new-password"
                />
                {errors.form && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errors.form}
                  </div>
                )}
                <Button type="submit" disabled={loading} className="mt-2">
                  {loading ? 'Guardando...' : 'Guardar contraseña'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
