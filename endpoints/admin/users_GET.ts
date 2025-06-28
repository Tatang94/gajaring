import { db } from '../../helpers/db';
import { schema } from './users_GET.schema';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { NotAuthenticatedError } from '../../helpers/getSetServerSession';
import { z } from 'zod';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const queryParams = {
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : 20,
      cursor: url.searchParams.get('cursor') ? parseInt(url.searchParams.get('cursor')!, 10) : null,
    };

    const { limit, cursor } = schema.parse(queryParams);

    let query = db
      .selectFrom('users')
      .selectAll()
      .orderBy('users.id', 'asc')
      .limit(limit);

    if (cursor) {
      query = query.where('users.id', '>', cursor);
    }

    const users = await query.execute();

    const nextCursor = users.length === limit ? users[users.length - 1].id : null;

    const formattedUsers = users.map(u => ({
        id: u.id,
        displayName: u.display_name,
        username: u.username,
        email: u.email,
        avatarUrl: u.avatar_url,
        bio: u.bio,
        role: u.role,
        followersCount: u.followers_count,
        followingCount: u.following_count,
        postsCount: u.posts_count,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
    }));

    return Response.json({
      users: formattedUsers,
      nextCursor,
    });
  } catch (error) {
    console.error('Admin error fetching users:', error);
    if (error instanceof NotAuthenticatedError) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}