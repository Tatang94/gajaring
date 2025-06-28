import { db } from '../helpers/db';
import { schema } from './profile_GET.schema';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = {
      userId: url.searchParams.get('userId') ? parseInt(url.searchParams.get('userId')!, 10) : null,
    };

    const { userId } = schema.parse(queryParams);

    if (!userId) {
      return Response.json({ error: 'userId parameter is required' }, { status: 400 });
    }

    const user = await db
      .selectFrom('users')
      .select([
        'id',
        'display_name as displayName',
        'username',
        'avatar_url as avatarUrl',
        'bio',
        'followers_count as followersCount',
        'following_count as followingCount',
        'posts_count as postsCount',
        'created_at as createdAt',
        'is_verified as isVerified',
      ])
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 0,
      postsCount: user.postsCount || 0,
      createdAt: user.createdAt,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}