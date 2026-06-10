import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Escribe tu correo.'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (err) {
      setError('No se pudo enviar el correo. Intenta de nuevo.')
      return
    }
    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-md md:p-10">
          {sent ? (
            <div className="text-center">
              <h1 className="font-serif text-2xl font-bold text-ink">Revisa tu correo</h1>
              <p className="mt-3 text-sm text-muted">
                Enviamos un enlace a <strong>{email}</strong> para restablecer tu contraseña.
              </p>
              <Link to="/login">
                <Button className="mt-6 w-full">Volver al inicio de sesión</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="font-serif text-3xl font-bold leading-tight text-ink">
                  Recuperar <span className="italic text-accent">contraseña</span>
                </h1>
                <p className="mt-2 font-serif text-sm italic text-muted">
                  Te enviaremos un enlace a tu correo
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Correo"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={loading} className="mt-2">
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                <Link to="/login" className="font-medium text-accent transition-colors hover:underline">
                  Volver al inicio de sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
