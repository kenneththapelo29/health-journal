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

  // Get last 7 days of workouts
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const workouts = await prisma.workout.findMany({
    where: {
      userId: user.id,
      timestamp: { gte: sevenDaysAgo },
    },
    orderBy: { timestamp: "desc" },
  });

  // Group by date for chart
  const chartMap: Record<string, { date: string; duration: number; calories: number; count: number }> = {};
  workouts.forEach((w) => {
    const d = w.timestamp.toISOString().split("T")[0];
    if (!chartMap[d]) chartMap[d] = { date: d, duration: 0, calories: 0, count: 0 };
    chartMap[d].duration += w.duration;
    chartMap[d].calories += w.calories || 0;
    chartMap[d].count++;
  });

  const chartData = Object.values(chartMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  return NextResponse.json({ workouts, chartData });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { type, duration, calories, intensity, notes } = body;

  if (!type || !duration) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const workout = await prisma.workout.create({
    data: {
      userId: user.id,
      type,
      duration: parseInt(duration),
      calories: calories ? parseInt(calories) : null,
      intensity: intensity || null,
      notes: notes || null,
    },
  });

  return NextResponse.json(workout, { status: 201 });
}

