import { db } from '../helpers/db';
import { schema } from './posts_GET.schema';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = {
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : 20,
      cursor: url.searchParams.get('cursor') ? parseInt(url.searchParams.get('cursor')!, 10) : null,
    };

    const { limit, cursor } = schema.parse(queryParams);

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
        'users.is_verified as isVerified',
      ])
      .orderBy('posts.created_at', 'desc')
      .limit(limit);

    if (cursor) {
      query = query.where('posts.id', '<', cursor);
    }

    const posts = await query.execute();

    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;

    return Response.json({
      posts,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}