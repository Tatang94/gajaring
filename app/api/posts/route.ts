import { NextRequest, NextResponse } from 'next/server'
import { mockPosts } from '../../../helpers/mockPosts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor') ? parseInt(searchParams.get('cursor')) : null

    let filteredPosts = [...mockPosts]
    
    if (cursor) {
      filteredPosts = filteredPosts.filter(post => post.id < cursor)
    }

    const posts = filteredPosts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null

    return NextResponse.json({
      posts,
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = JSON.parse(sessionCookie.value)
    const body = await request.json()
    const { content, imageUrl } = body

    const newPost = {
      id: mockPosts.length + 1,
      content,
      imageUrl: imageUrl || null,
      createdAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      userId: user.id,
      userDisplayName: user.displayName,
      userUsername: null,
      userAvatarUrl: user.avatarUrl,
      isVerified: false,
    }

    mockPosts.push(newPost)

    return NextResponse.json(newPost)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}