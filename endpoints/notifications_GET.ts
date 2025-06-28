import { db } from '../helpers/db';
import { getServerUserSession } from '../helpers/getServerUserSession';
import { sql } from 'kysely';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const notifications = await db
      .selectFrom('notifications')
      .leftJoin('users as triggerUser', 'notifications.trigger_user_id', 'triggerUser.id')
      .leftJoin('posts as relatedPost', 'notifications.related_post_id', 'relatedPost.id')
      .where('notifications.user_id', '=', user.id)
      .select([
        'notifications.id',
        'notifications.type',
        'notifications.message',
        'notifications.is_read as isRead',
        'notifications.created_at as createdAt',
        'triggerUser.id as triggerUserId',
        'triggerUser.display_name as triggerUserDisplayName',
        'triggerUser.username as triggerUserUsername',
        'triggerUser.avatar_url as triggerUserAvatarUrl',
        'relatedPost.id as relatedPostId',
        sql<string>`LEFT(relatedPost.content, 50)`.as('relatedPostContent'),
      ])
      .orderBy('notifications.created_at', 'desc')
      .limit(50) // Limit to recent 50 notifications
      .execute();

    return Response.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}