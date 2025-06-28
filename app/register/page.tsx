'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../helpers/useAuth'
import Register from '../../pages/register'

export default function RegisterPage() {
  const { authState } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authState.type === 'authenticated') {
      router.push('/')
    }
  }, [authState.type, router])

  if (authState.type === 'authenticated') {
    return null // Will redirect
  }

  return <Register />
}