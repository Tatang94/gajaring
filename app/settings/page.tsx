'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../helpers/useAuth'
import { AuthLoadingState } from '../../components/AuthLoadingState'
import SettingsPage from '../../pages/settings'

export default function Settings() {
  const { authState } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authState.type === 'unauthenticated') {
      router.push('/login')
    }
  }, [authState.type, router])

  if (authState.type === 'loading') {
    return <AuthLoadingState />
  }

  if (authState.type === 'unauthenticated') {
    return null // Will redirect
  }

  return <SettingsPage />
}