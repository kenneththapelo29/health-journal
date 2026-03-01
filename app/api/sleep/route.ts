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

  const sleepLogs = await prisma.sleep.findMany({
    where: {
      userId: user.id,
      timestamp: { gte: sevenDaysAgo },
    },
    orderBy: { timestamp: "desc" },
  });

  // Chart data - duration and quality per day
  const chartData = sleepLogs.map((log) => {
    const duration =
      (new Date(log.wakeTime).getTime() - new Date(log.bedtime).getTime()) / (1000 * 60 * 60);
    return {
      date: log.timestamp.toISOString().split("T")[0],
      duration: Math.round(duration * 10) / 10,
      quality: log.quality,
    };
  }).reverse();

  // Stats
  const avgDuration =
    sleepLogs.length > 0
      ? sleepLogs.reduce((acc, log) => {
          const dur =
            (new Date(log.wakeTime).getTime() - new Date(log.bedtime).getTime()) /
            (1000 * 60 * 60);
          return acc + dur;
        }, 0) / sleepLogs.length
      : 0;

  const avgQuality =
    sleepLogs.length > 0
      ? sleepLogs.reduce((acc, log) => acc + log.quality, 0) / sleepLogs.length
      : 0;

  return NextResponse.json({
    sleepLogs,
    chartData,
    avgDuration: Math.round(avgDuration * 10) / 10,
    avgQuality: Math.round(avgQuality * 10) / 10,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { bedtime, wakeTime, quality, notes } = body;

  if (!bedtime || !wakeTime || !quality) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const bedtimeDate = new Date(bedtime);
  const wakeTimeDate = new Date(wakeTime);

  if (wakeTimeDate <= bedtimeDate) {
    // Handle overnight sleep - add 1 day to wake time if needed
    wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
  }

  const sleep = await prisma.sleep.create({
    data: {
      userId: user.id,
      bedtime: bedtimeDate,
      wakeTime: wakeTimeDate,
      quality: parseInt(quality),
      notes: notes || null,
    },
  });

  return NextResponse.json(sleep, { status: 201 });
}

