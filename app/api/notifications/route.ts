import { NextRequest, NextResponse } from 'next/server'
import { mockNotifications } from '../../../helpers/mockNotifications'

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
    
    // Filter notifications for current user
    const userNotifications = mockNotifications.filter(n => n.userId === user.id)

    return NextResponse.json(userNotifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}