import { db } from '../../helpers/db';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { NotAuthenticatedError } from '../../helpers/getSetServerSession';

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return Response.json({ error: 'You must be an admin to view ads.' }, { status: 403 });
    }

    const ads = await db.selectFrom('ads').selectAll().orderBy('created_at', 'desc').execute();

    const formattedAds = ads.map(ad => ({
      ...ad,
      isActive: ad.is_active,
      scriptCode: ad.script_code,
      imageUrl: ad.image_url,
      linkUrl: ad.link_url,
      createdAt: ad.created_at,
    }));

    return Response.json({ ads: formattedAds });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return Response.json({ error: (error as Error).message }, { status: 401 });
    }
    console.error('Error fetching ads:', error);
    return Response.json({ error: 'An unexpected error occurred while fetching ads.' }, { status: 500 });
  }
}