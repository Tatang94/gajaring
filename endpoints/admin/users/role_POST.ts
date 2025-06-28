import { db } from '../../../helpers/db';
import { schema } from './role_POST.schema';
import { getServerUserSession } from '../../../helpers/getServerUserSession';
import { NotAuthenticatedError } from '../../../helpers/getSetServerSession';
import { z } from 'zod';

export async function handle(request: Request) {
  try {
    const { user: adminUser } = await getServerUserSession(request);
    if (adminUser.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const json = await request.json();
    const { userId, role } = schema.parse(json);

    if (userId === adminUser.id) {
        return Response.json({ error: 'Cannot change your own role' }, { status: 400 });
    }

    const result = await db
      .updateTable('users')
      .set({ role })
      .where('id', '=', userId)
      .executeTakeFirst();

    if (result.numUpdatedRows === 0n) {
      return Response.json({ error: 'User not found or role is already set to the target value' }, { status: 404 });
    }

    return Response.json({ success: true, message: `User role updated to ${role}` });
  } catch (error) {
    console.error('Admin error updating user role:', error);
    if (error instanceof NotAuthenticatedError) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}