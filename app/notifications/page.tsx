'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../helpers/useAuth'
import { AuthLoadingState } from '../../components/AuthLoadingState'
import NotificationsPage from '../../pages/notifications'
import { AppLayout } from '../../components/AppLayout'

export default function Notifications() {
  const { authState } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authState.type === 'unauthenticated') {
      router.push('/login')
    }
  }, [authState.type, router])

  if (authState.type === 'loading') {
    return (
      <AppLayout>
        <AuthLoadingState />
      </AppLayout>
    )
  }

  if (authState.type === 'unauthenticated') {
    return null // Will redirect
  }

  return (
    <AppLayout>
      <NotificationsPage />
    </AppLayout>
  )
}