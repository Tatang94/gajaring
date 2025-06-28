'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../helpers/useAuth'
import { AuthLoadingState } from '../../components/AuthLoadingState'
import { AppLayout } from '../../components/AppLayout'

export default function ProfileRedirect() {
  const { authState } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authState.type === 'authenticated') {
      router.push(`/profile/${authState.user.id}`)
    } else if (authState.type === 'unauthenticated') {
      router.push('/login')
    }
  }, [authState, router])

  if (authState.type === 'loading') {
    return (
      <AppLayout>
        <AuthLoadingState />
      </AppLayout>
    )
  }

  return null // Will redirect
}