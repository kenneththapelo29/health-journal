import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await prisma.healthEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Get entries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, weight, sleep, calories, steps, mood, notes } = await req.json();

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const entry = await prisma.healthEntry.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(date),
        },
      },
      update: {
        weight: weight ?? undefined,
        sleep: sleep ?? undefined,
        calories: calories ?? undefined,
        steps: steps ?? undefined,
        mood: mood ?? undefined,
        notes: notes ?? undefined,
      },
      create: {
        userId,
        date: new Date(date),
        weight,
        sleep,
        calories,
        steps,
        mood,
        notes,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Create entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
