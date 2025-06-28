import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema } from './read_POST.schema';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const { notificationIds } = schema.parse(await request.json());

    if (notificationIds.length === 0) {
      return Response.json({ success: true, message: 'No notifications to mark as read.' });
    }

    const result = await db
      .updateTable('notifications')
      .set({ is_read: true })
      .where('user_id', '=', user.id)
      .where('id', 'in', notificationIds)
      .executeTakeFirst();

    return Response.json({ success: true, updatedCount: Number(result.numUpdatedRows) });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}