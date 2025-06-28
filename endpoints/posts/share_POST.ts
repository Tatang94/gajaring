import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema } from './share_POST.schema';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const { postId } = schema.parse(await request.json());

    const post = await db.selectFrom('posts').select('user_id').where('id', '=', postId).executeTakeFirst();
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    // For simplicity, we allow multiple shares by the same user.
    // In a real app, we might want to handle this differently (e.g., reposting).
    await db
      .insertInto('shares')
      .values({
        user_id: user.id,
        post_id: postId,
      })
      .execute();

    // Create notification if not sharing own post
    if (user.id !== post.user_id) {
      await db
        .insertInto('notifications')
        .values({
          user_id: post.user_id,
          type: 'share',
          trigger_user_id: user.id,
          related_post_id: postId,
          message: 'shared your post',
        })
        .execute();
    }

    return Response.json({ success: true, message: 'Post shared successfully' });
  } catch (error) {
    console.error('Error sharing post:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}