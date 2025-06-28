import { db } from '../helpers/db';
import { getServerUserSession } from '../helpers/getServerUserSession';
import { schema } from './posts_POST.schema';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const json = await request.json();
    const { content, imageUrl } = schema.parse(json);

    const [newPost] = await db
      .insertInto('posts')
      .values({
        user_id: user.id,
        content,
        image_url: imageUrl,
      })
      .returningAll()
      .execute();

    return Response.json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}