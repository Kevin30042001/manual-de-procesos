import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
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

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (err) {
      setError('Correo o contraseña incorrectos.')
      return
    }
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md">
        {/* Decorative top */}
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
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl font-bold leading-tight text-ink">
              Manual de{' '}
              <span className="italic text-accent">Procesos</span>
            </h1>
            <p className="mt-2 font-serif text-sm italic text-muted">
              Tu manual vivo de operaciones
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Correo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-muted transition-colors hover:text-accent"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-accent transition-colors hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center font-serif text-xs italic text-muted/70">
          Inicia sesión para consultar tu manual
        </p>
      </div>
    </div>
  )
}
