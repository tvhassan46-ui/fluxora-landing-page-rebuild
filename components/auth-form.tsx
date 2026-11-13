'use client'

import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, MoveRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LanguageSwitch } from '@/components/language-switch'
import { useLanguage } from '@/components/language-provider'
import { getAuthCopy } from '@/lib/auth-copy'
import { authClient } from '@/lib/auth-client'

type AuthFormProps = { mode: 'sign-in' | 'sign-up' }

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const { locale } = useLanguage()
  const copy = getAuthCopy(locale)
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
        : await authClient.signIn.email({ email: email.trim().toLowerCase(), password, rememberMe: true })

      if (result.error) {
        setError(copy.error)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(copy.error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <main className="auth-page" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
      <div className="auth-orbit auth-orbit-one" aria-hidden="true" />
      <div className="auth-orbit auth-orbit-two" aria-hidden="true" />
      <div className="auth-topbar"><Link className="auth-brand" href="/" aria-label={locale === 'ar' ? 'الصفحة الرئيسية لموقع LIVRA' : 'LIVRA home'}><Image src="/livra-logo.svg" alt="" width={28} height={28} />LIVRA</Link><LanguageSwitch /></div>
      <section className="auth-card" aria-labelledby="auth-title">
        <Link className="auth-back" href="/">{locale === 'ar' ? '→' : '←'} {copy.back}</Link>
        <p className="auth-eyebrow">{copy.eyebrow}</p>
        <h1 id="auth-title">{isSignUp ? copy.signUpTitle : copy.signInTitle}</h1>
        <p className="auth-intro">{isSignUp ? copy.signUpDescription : copy.signInDescription}</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="auth-field">
              <label htmlFor="name">{copy.name}</label>
              <input id="name" name="name" type="text" autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="email">{copy.email}</label>
            <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="password">{copy.password}</label>
            <div className="auth-password-wrap">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignUp ? 'new-password' : 'current-password'} required minLength={isSignUp ? 8 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />
              <button className="auth-password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? copy.hidePassword : copy.showPassword} aria-pressed={showPassword}>
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </div>
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={isPending}>
            <span>{isPending ? copy.wait : isSignUp ? copy.createAccount : copy.signIn}</span>
            {!isPending && <MoveRight aria-hidden="true" />}
          </button>
        </form>
        <p className="auth-switch">
          {isSignUp ? copy.existingAccount : copy.newAccount}{' '}
          <Link href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? copy.signIn : copy.createAccount}</Link>
        </p>
      </section>
      <p className="auth-footer">{copy.dashboardFooter}</p>
    </main>
  )
}
