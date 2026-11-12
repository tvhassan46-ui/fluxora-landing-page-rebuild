'use client'

import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, MoveRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

type AuthFormProps = { mode: 'sign-in' | 'sign-up' }

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const isSignUp = mode === 'sign-up'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsPending(true)

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim().toLowerCase(), password })
        : await authClient.signIn.email({ email: email.trim().toLowerCase(), password })

      if (result.error) {
        setError('We couldn’t complete that request. Check your details and try again.')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('We couldn’t complete that request. Check your details and try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-orbit auth-orbit-one" aria-hidden="true" />
      <div className="auth-orbit auth-orbit-two" aria-hidden="true" />
      <Link className="auth-brand" href="/" aria-label="Hikaya home"><span className="auth-brand-mark" aria-hidden="true">✳</span>Hikaya</Link>
      <section className="auth-card" aria-labelledby="auth-title">
        <Link className="auth-back" href="/">← Back to Hikaya</Link>
        <p className="auth-eyebrow">A world of books, stories, and ideas</p>
        <h1 id="auth-title">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-intro">{isSignUp ? 'Create an account to explore classic books, novels, and literary quotes.' : 'Sign in to continue reading your books and stories.'}</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="auth-field">
              <label htmlFor="name">Your name</label>
              <input id="name" name="name" type="text" autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-password-wrap">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignUp ? 'new-password' : 'current-password'} required minLength={isSignUp ? 8 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />
              <button className="auth-password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </div>
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={isPending}>
            <span>{isPending ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}</span>
            {!isPending && <MoveRight aria-hidden="true" />}
          </button>
        </form>
        <p className="auth-switch">
          {isSignUp ? 'Already have an account?' : 'New to Hikaya?'}{' '}
          <Link href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Create an account'}</Link>
        </p>
      </section>
      <p className="auth-footer">A home for books, novels, and literary favorites.</p>
    </main>
  )
}
