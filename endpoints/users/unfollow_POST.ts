import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema } from './unfollow_POST.schema';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const { userIdToUnfollow } = schema.parse(await request.json());

    const result = await db
      .deleteFrom('follows')
      .where('follower_id', '=', user.id)
      .where('following_id', '=', userIdToUnfollow)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return Response.json({ success: false, message: 'You were not following this user.' }, { status: 400 });
    }

    return Response.json({ success: true, message: 'User unfollowed successfully.' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}