import { db } from '../../helpers/db';
import { sql } from 'kysely';
import { schema } from './search_GET.schema';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = {
      query: url.searchParams.get('query') || '',
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : 10,
    };

    const { query, limit } = schema.parse(queryParams);

    if (!query) {
      return Response.json([]);
    }

    const users = await db
      .selectFrom('users')
      .select(['id', 'display_name as displayName', 'username', 'avatar_url as avatarUrl', 'is_verified as isVerified'])
      .where(sql`display_name ILIKE ${'%' + query + '%'}`)
          .where((eb) => 
      eb.or([
        eb('display_name', 'ilike', `%${query}%`),
        eb('username', 'ilike', `%${query}%`)
      ])
    )
      .limit(limit)
      .execute();

    return Response.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}