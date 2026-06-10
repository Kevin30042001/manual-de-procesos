
import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PUESTOS } from '../lib/puestos'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-accent"
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="9" y1="7" x2="16" y2="7" />
      <line x1="9" y1="11" x2="16" y2="11" />
    </svg>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [puesto, setPuesto] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!fullName.trim()) errs.fullName = 'Escribe tu nombre.'
    if (!puesto) errs.puesto = 'Selecciona tu puesto.'
    if (!email.trim()) errs.email = 'Escribe tu correo.'
    if (password.length < 6)
      errs.password = 'La contraseña debe tener al menos 6 caracteres.'
    if (password !== confirm) errs.confirm = 'Las contraseñas no coinciden.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), puesto },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    setLoading(false)

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('already') || msg.includes('registered')) {
        setErrors({ email: 'Ese correo ya está registrado.' })
      } else {
        setErrors({ form: 'No se pudo crear la cuenta. Intenta de nuevo.' })
      }
      return
    }

    // Si el proyecto exige confirmar correo, no hay sesión todavía
    if (data.session) {
      navigate('/')
    } else {
      setConfirmSent(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface shadow-sm">
            <BookIcon />
          </div>
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-border" />
            <span className="font-serif text-muted/60">❦</span>
            <span className="h-px w-12 bg-border" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-md md:p-10">
          {confirmSent ? (
            <div className="text-center">
              <h1 className="font-serif text-2xl font-bold text-ink">
                Revisa tu correo
              </h1>
              <p className="mt-3 text-sm text-muted">
                Te enviamos un enlace a <strong>{email}</strong> para confirmar tu
                cuenta. Ábrelo y luego inicia sesión.
              </p>
              <Link to="/login">
                <Button className="mt-6 w-full">Ir a iniciar sesión</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="font-serif text-3xl font-bold leading-tight text-ink">
                  Crear <span className="italic text-accent">cuenta</span>
                </h1>
                <p className="mt-2 font-serif text-sm italic text-muted">
                  Regístrate para acceder al manual
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Nombre completo *"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={errors.fullName}
                  autoComplete="name"
                />

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-ink">Puesto *</label>
                  <select
                    value={puesto}
                    onChange={(e) => setPuesto(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">Seleccionar...</option>
                    {PUESTOS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {errors.puesto && (
                    <p className="text-xs text-red-600">{errors.puesto}</p>
                  )}
                </div>

                <Input
                  label="Correo *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  autoComplete="email"
                />
                <Input
                  label="Contraseña *"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  autoComplete="new-password"
                />
                <Input
                  label="Confirmar contraseña *"
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
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  className="font-medium text-accent transition-colors hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
