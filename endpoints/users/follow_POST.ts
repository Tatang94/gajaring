import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema } from './follow_POST.schema';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const { userIdToFollow } = schema.parse(await request.json());

    if (user.id === userIdToFollow) {
      return Response.json({ error: "You cannot follow yourself." }, { status: 400 });
    }

    const targetUser = await db.selectFrom('users').select('id').where('id', '=', userIdToFollow).executeTakeFirst();
    if (!targetUser) {
      return Response.json({ error: 'User to follow not found' }, { status: 404 });
    }

    const existingFollow = await db
      .selectFrom('follows')
      .where('follower_id', '=', user.id)
      .where('following_id', '=', userIdToFollow)
      .executeTakeFirst();

    if (existingFollow) {
      return Response.json({ success: true, message: 'Already following this user.' });
    }

    await db
      .insertInto('follows')
      .values({
        follower_id: user.id,
        following_id: userIdToFollow,
      })
      .execute();

    await db
      .insertInto('notifications')
      .values({
        user_id: userIdToFollow,
        type: 'follow',
        trigger_user_id: user.id,
        message: 'started following you',
      })
      .execute();

    return Response.json({ success: true, message: 'User followed successfully.' });
  } catch (error) {
    console.error('Error following user:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}