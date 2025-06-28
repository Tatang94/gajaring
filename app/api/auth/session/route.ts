import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = JSON.parse(sessionCookie.value)
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json(
      { error: 'Session validation failed' },
      { status: 400 }
    )
  }
}