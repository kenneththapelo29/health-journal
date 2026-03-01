import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const moods = await prisma.mood.findMany({
    where: {
      userId: user.id,
      timestamp: { gte: sevenDaysAgo },
    },
    orderBy: { timestamp: "desc" },
  });

  // Group by date for chart
  const chartMap: Record<string, { date: string; avgRating: number; count: number; total: number }> = {};
  moods.forEach((m) => {
    const d = m.timestamp.toISOString().split("T")[0];
    if (!chartMap[d]) chartMap[d] = { date: d, avgRating: 0, count: 0, total: 0 };
    chartMap[d].total += m.rating;
    chartMap[d].count++;
    chartMap[d].avgRating = Math.round((chartMap[d].total / chartMap[d].count) * 10) / 10;
  });

  const chartData = Object.values(chartMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  // Tag frequency
  const tagMap: Record<string, number> = {};
  moods.forEach((m) => {
    m.tags.forEach((tag) => {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  return NextResponse.json({ moods, chartData, topTags });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { rating, notes, tags } = body;

  if (!rating || rating < 1 || rating > 10) {
    return NextResponse.json({ error: "Rating must be between 1 and 10" }, { status: 400 });
  }

  const mood = await prisma.mood.create({
    data: {
      userId: user.id,
      rating: parseInt(rating),
      notes: notes || null,
      tags: tags || [],
    },
  });

  return NextResponse.json(mood, { status: 201 });
}

