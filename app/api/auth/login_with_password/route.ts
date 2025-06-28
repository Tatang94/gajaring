import { NextRequest, NextResponse } from 'next/server'
import { mockUsers, mockUserPasswords } from '../../../../helpers/mockAuth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Find user by email
    const user = mockUsers.find(u => u.email === email)
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password (in real app, use bcrypt)
    const userPassword = mockUserPasswords.find(p => p.user_id === user.id)
    if (!userPassword || userPassword.password !== password) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return user data
    const userData = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      role: user.role,
    }

    const response = NextResponse.json({ user: userData })
    
    // Set session cookie
    response.cookies.set('session', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 400 }
    )
  }
}