'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function DashboardActions() {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.replace('/')
    router.refresh()
  }

  return <button className="dashboard-signout" type="button" onClick={handleSignOut}>Sign out</button>
}
