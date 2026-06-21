import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PENDING' },
      orderBy: { priorityScore: 'desc' },
      include: { source: true, category: true }
    });
    return NextResponse.json({ success: true, count: articles.length, data: articles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
