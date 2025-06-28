import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { schema } from './verify_POST.schema';

export async function handle(request: Request) {
  try {
    // 1. Authenticate and authorize the request
    const user = await getServerUserSession(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if the user is an admin
    if (user.user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: You do not have permission to perform this action.' }, { status: 403 });
    }

    // 3. Parse and validate the request body
    const json = await request.json();
    const { userId, isVerified } = schema.parse(json);

    // 4. Perform the database update
    const result = await db
      .updateTable('users')
      .set({ is_verified: isVerified })
      .where('id', '=', userId)
      .executeTakeFirst();

    // 5. Check if the user existed and was updated
    if (result.numUpdatedRows === 0n) {
      return Response.json({ error: `User with ID ${userId} not found.` }, { status: 404 });
    }

    console.log(`Admin (ID: ${user.user.id}) updated verification status for user (ID: ${userId}) to ${isVerified}.`);

    // 6. Return a success response
    return Response.json({
      success: true,
      message: `User verification status updated successfully.`,
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in verify_POST endpoint:', error);
      // Handle Zod validation errors specifically
      if ('issues' in error) {
        return Response.json({ error: 'Invalid request body.', issues: (error as any).issues }, { status: 400 });
      }
      return Response.json({ error: error.message }, { status: 400 });
    }
    // Fallback for non-Error objects
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}