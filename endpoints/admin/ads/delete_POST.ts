import { z } from 'zod';
import { db } from '../../../helpers/db';
import { getServerUserSession } from '../../../helpers/getServerUserSession';
import { NotAuthenticatedError } from '../../../helpers/getSetServerSession';
import { schema } from './delete_POST.schema';

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return Response.json({ error: 'You must be an admin to delete an ad.' }, { status: 403 });
    }

    const json = await request.json();
    const { adId } = schema.parse(json);

    const result = await db
      .deleteFrom('ads')
      .where('id', '=', adId)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return Response.json({ error: 'Ad not found or already deleted.' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Ad deleted successfully.' });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return Response.json({ error: (error as Error).message }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input data.', details: (error as z.ZodError).errors }, { status: 400 });
    }
    console.error('Error deleting ad:', error);
    return Response.json({ error: 'An unexpected error occurred while deleting the ad.' }, { status: 500 });
  }
}