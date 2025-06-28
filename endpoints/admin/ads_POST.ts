import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { NotAuthenticatedError } from '../../helpers/getSetServerSession';
import { schema, Ad } from './ads_POST.schema';
import { z } from 'zod';

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return Response.json({ error: 'You must be an admin to create an ad.' }, { status: 403 });
    }

    const json = await request.json();
    const input = schema.parse(json);

    const adToInsert = {
      type: input.type,
      title: input.title,
      is_active: input.isActive,
      content: input.type === 'promotional' ? input.content : null,
      script_code: input.type === 'script' ? input.scriptCode : null,
      image_url: input.type === 'promotional' ? input.imageUrl : null,
      link_url: input.type === 'promotional' ? input.linkUrl : null,
    };

    const [newAd] = await db
      .insertInto('ads')
      .values(adToInsert)
      .returningAll()
      .execute();

    const formattedAd: Ad = {
      id: newAd.id,
      type: newAd.type as 'script' | 'promotional',
      title: newAd.title,
      content: newAd.content,
      scriptCode: newAd.script_code,
      imageUrl: newAd.image_url,
      linkUrl: newAd.link_url,
      isActive: newAd.is_active,
      createdAt: newAd.created_at!,
    };

    return Response.json({ ad: formattedAd }, { status: 201 });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return Response.json({ error: (error as Error).message }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input data.', details: (error as z.ZodError).errors }, { status: 400 });
    }
    console.error('Error creating ad:', error);
    return Response.json({ error: 'An unexpected error occurred while creating the ad.' }, { status: 500 });
  }
}