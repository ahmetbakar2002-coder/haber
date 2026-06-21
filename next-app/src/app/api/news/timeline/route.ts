import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');

  try {
    const filter = topic ? { topic: { contains: topic } } : {};
    
    const events = await prisma.timelineEvent.findMany({
      where: filter,
      orderBy: { eventDate: 'asc' },
      include: { article: { select: { id: true, title: true, slug: true } } }
    });
    
    return NextResponse.json({ success: true, count: events.length, data: events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
