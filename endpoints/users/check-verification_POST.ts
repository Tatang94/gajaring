import { db } from '../../helpers/db';
import { schema } from './check-verification_POST.schema';

export async function handle(request: Request) {
  try {
    // 1. Parse and validate the request body
    const json = await request.json();
    const { userId } = schema.parse(json);

    console.log(`Checking verification status for user ID: ${userId}`);

    // 2. Get current user data including follower count and verification status
    const user = await db
      .selectFrom('users')
      .select(['id', 'followers_count', 'is_verified', 'role'])
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      return Response.json({ error: `User with ID ${userId} not found.` }, { status: 404 });
    }

    const followersCount = user.followers_count || 0;
    const currentlyVerified = user.is_verified || false;
    const isAdmin = user.role === 'admin';

    console.log(`User ${userId}: followers=${followersCount}, verified=${currentlyVerified}, admin=${isAdmin}`);

    let shouldBeVerified = currentlyVerified;
    let verificationChanged = false;

    // 3. Apply verification logic
    if (followersCount >= 5000 && !currentlyVerified) {
      // User meets criteria and isn't verified - auto-verify
      shouldBeVerified = true;
      verificationChanged = true;
      console.log(`Auto-verifying user ${userId} (${followersCount} followers)`);
    } else if (followersCount < 5000 && currentlyVerified && !isAdmin) {
      // User doesn't meet criteria and is verified (but not admin) - remove verification
      // Note: We don't remove verification from admins as they might have been manually verified
      shouldBeVerified = false;
      verificationChanged = true;
      console.log(`Removing verification from user ${userId} (${followersCount} followers, not admin)`);
    }

    // 4. Update verification status if needed
    if (verificationChanged) {
      await db
        .updateTable('users')
        .set({ is_verified: shouldBeVerified })
        .where('id', '=', userId)
        .execute();

      console.log(`Updated verification status for user ${userId} to ${shouldBeVerified}`);
    }

    // 5. Return current verification status
    return Response.json({
      userId,
      isVerified: shouldBeVerified,
      followersCount,
      verificationChanged,
      reason: verificationChanged 
        ? (shouldBeVerified ? 'Auto-verified due to follower count >= 5000' : 'Verification removed due to follower count < 5000')
        : 'No change needed'
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in check-verification_POST endpoint:', error);
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