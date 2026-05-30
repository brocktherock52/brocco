/**
 * /api/alerts/[id]/read
 *   POST - mark a single alert read (auth required; alert must belong to user).
 */
import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projectAlerts } from '@/lib/db/schema';

export const runtime = 'nodejs';

async function requireUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return null;
  return session.user;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await ctx.params;

  const [row] = await db
    .update(projectAlerts)
    .set({ status: 'read' })
    .where(and(eq(projectAlerts.id, id), eq(projectAlerts.userId, user.id)))
    .returning();

  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ alert: row });
}
