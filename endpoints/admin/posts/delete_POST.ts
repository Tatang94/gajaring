import { db } from '../../../helpers/db';
import { schema } from './delete_POST.schema';
import { getServerUserSession } from '../../../helpers/getServerUserSession';
import { NotAuthenticatedError } from '../../../helpers/getSetServerSession';
import { z } from 'zod';
import { sql } from 'kysely';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const json = await request.json();
    const { postId } = schema.parse(json);

    const result = await db.transaction().execute(async (trx) => {
      const postToDelete = await trx
        .selectFrom('posts')
        .select('user_id')
        .where('id', '=', postId)
        .executeTakeFirst();

      if (!postToDelete) {
        throw new Error('Post not found');
      }

      // Delete the post and related data
      await trx.deleteFrom('likes').where('post_id', '=', postId).execute();
      await trx.deleteFrom('comments').where('post_id', '=', postId).execute();
      await trx.deleteFrom('shares').where('post_id', '=', postId).execute();
      await trx.deleteFrom('notifications').where('related_post_id', '=', postId).execute();
      const deleteResult = await trx.deleteFrom('posts').where('id', '=', postId).executeTakeFirst();

      // Decrement user's post count
      if (postToDelete.user_id) {
        await trx
          .updateTable('users')
          .set({ posts_count: sql`posts_count - 1` })
          .where('id', '=', postToDelete.user_id)
          .where('posts_count', '>', 0)
          .execute();
      }

      return deleteResult;
    });

    if (result.numDeletedRows === 0n) {
      return Response.json({ error: 'Post not found or already deleted' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Admin error deleting post:', error);
    if (error instanceof NotAuthenticatedError) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}