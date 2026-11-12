'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { useLanguage } from '@/components/language-provider'
import { getAuthCopy } from '@/lib/auth-copy'

export function DashboardActions() {
  const router = useRouter()
  const { locale } = useLanguage()
  const copy = getAuthCopy(locale)

  async function handleSignOut() {
    await authClient.signOut()
    router.replace('/')
    router.refresh()
  }

  return <button className="dashboard-signout" type="button" onClick={handleSignOut}>{copy.signOut}</button>
}
