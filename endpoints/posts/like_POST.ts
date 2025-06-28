import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema } from './like_POST.schema';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const { postId } = schema.parse(await request.json());

    const post = await db.selectFrom('posts').select('user_id').where('id', '=', postId).executeTakeFirst();
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    const existingLike = await db
      .selectFrom('likes')
      .where('user_id', '=', user.id)
      .where('post_id', '=', postId)
      .selectAll()
      .executeTakeFirst();

    if (existingLike) {
      await db.deleteFrom('likes').where('id', '=', existingLike.id).execute();
      return Response.json({ liked: false, message: 'Post unliked' });
    } else {
      await db.insertInto('likes').values({ user_id: user.id, post_id: postId }).execute();

      // Create notification if not liking own post
      if (user.id !== post.user_id) {
        await db
          .insertInto('notifications')
          .values({
            user_id: post.user_id,
            type: 'like',
            trigger_user_id: user.id,
            related_post_id: postId,
            message: 'liked your post',
          })
          .execute();
      }

      return Response.json({ liked: true, message: 'Post liked' });
    }
  } catch (error) {
    console.error('Error liking post:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}