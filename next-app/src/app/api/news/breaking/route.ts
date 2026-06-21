import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: { 
        status: 'PUBLISHED',
        isBreaking: true 
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      include: { liveUpdates: true } // Include live updates for breaking news
    });
    return NextResponse.json({ success: true, count: articles.length, data: articles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
