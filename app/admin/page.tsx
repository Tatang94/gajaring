'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../helpers/useAuth'
import { AuthLoadingState } from '../../components/AuthLoadingState'
import { AuthErrorPage } from '../../components/AuthErrorPage'
import AdminPage from '../../pages/admin'
import { AppLayout } from '../../components/AppLayout'
import { ShieldOff } from 'lucide-react'

export default function Admin() {
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

  if (authState.user.role !== 'admin') {
    return (
      <AppLayout>
        <AuthErrorPage
          title="Access Denied"
          message={`Access denied. Your role (${authState.user.role}) lacks required permissions.`}
          icon={<ShieldOff size={64} style={{ color: 'var(--warning)' }} />}
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <AdminPage />
    </AppLayout>
  )
}