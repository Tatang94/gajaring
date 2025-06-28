import { NextRequest, NextResponse } from 'next/server'
import { mockUsers, mockUserPasswords } from '../../../../helpers/mockAuth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, displayName } = body

    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      email,
      display_name: displayName,
      role: 'user' as const,
      avatar_url: null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    mockUsers.push(newUser)
    mockUserPasswords.push({
      user_id: newUser.id,
      password,
      created_at: new Date(),
      updated_at: new Date(),
    })

    const userData = {
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.display_name,
      avatarUrl: newUser.avatar_url,
      role: newUser.role,
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 400 }
    )
  }
}