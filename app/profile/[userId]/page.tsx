'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../helpers/useAuth'
import { AuthLoadingState } from '../../../components/AuthLoadingState'
import ProfilePage from '../../../pages/profile.$userId'
import { AppLayout } from '../../../components/AppLayout'

export default function UserProfile({ params }: { params: { userId: string } }) {
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

  // Pass userId as a prop to the existing component
  return (
    <AppLayout>
      <ProfilePage userId={params.userId} />
    </AppLayout>
  )
}