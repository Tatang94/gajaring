import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema } from './comment_POST.schema';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const { postId, content } = schema.parse(await request.json());

    const post = await db.selectFrom('posts').select('user_id').where('id', '=', postId).executeTakeFirst();
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    const [newComment] = await db
      .insertInto('comments')
      .values({
        user_id: user.id,
        post_id: postId,
        content,
      })
      .returningAll()
      .execute();

    // Create notification if not commenting on own post
    if (user.id !== post.user_id) {
      await db
        .insertInto('notifications')
        .values({
          user_id: post.user_id,
          type: 'comment',
          trigger_user_id: user.id,
          related_post_id: postId,
          message: 'commented on your post',
        })
        .execute();
    }

    return Response.json(newComment);
  } catch (error) {
    console.error('Error commenting on post:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}