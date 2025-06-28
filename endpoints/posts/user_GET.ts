import { db } from '../../helpers/db';
import { schema } from './user_GET.schema';
import { z } from 'zod';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = {
      userId: url.searchParams.get('userId') ? parseInt(url.searchParams.get('userId')!, 10) : undefined,
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : 20,
      cursor: url.searchParams.get('cursor') ? parseInt(url.searchParams.get('cursor')!, 10) : null,
    };

    const { userId, limit, cursor } = schema.parse(queryParams);

    // First, check if user exists to provide a clear error message
    const userExists = await db.selectFrom('users').select('id').where('id', '=', userId).executeTakeFirst();
    if (!userExists) {
        return Response.json({ error: 'User not found' }, { status: 404 });
    }

    let query = db
      .selectFrom('posts')
      .innerJoin('users', 'posts.user_id', 'users.id')
      .select([
        'posts.id',
        'posts.content',
        'posts.image_url as imageUrl',
        'posts.created_at as createdAt',
        'posts.likes_count as likesCount',
        'posts.comments_count as commentsCount',
        'posts.shares_count as sharesCount',
        'users.id as userId',
        'users.display_name as userDisplayName',
        'users.username as userUsername',
        'users.avatar_url as userAvatarUrl',
      ])
      .where('posts.user_id', '=', userId)
      .orderBy('posts.created_at', 'desc')
      .limit(limit);

    if (cursor) {
      // Using the cursor for pagination
      query = query.where('posts.id', '<', cursor);
    }

    const posts = await query.execute();

    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;

    return Response.json({
      posts,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}