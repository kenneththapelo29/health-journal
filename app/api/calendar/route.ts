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

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const startDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endDate = to ? new Date(to) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  const [vitals, medications, workouts, moods, sleepLogs, nutrition] = await Promise.all([
    prisma.vital.findMany({
      where: { userId: user.id, timestamp: { gte: startDate, lte: endDate } },
      select: { id: true, timestamp: true, heartRate: true, bloodPressureSystolic: true },
    }),
    prisma.medication.findMany({
      where: { userId: user.id, timestamp: { gte: startDate, lte: endDate } },
      select: { id: true, timestamp: true, name: true, taken: true },
    }),
    prisma.workout.findMany({
      where: { userId: user.id, timestamp: { gte: startDate, lte: endDate } },
      select: { id: true, timestamp: true, type: true, duration: true },
    }),
    prisma.mood.findMany({
      where: { userId: user.id, timestamp: { gte: startDate, lte: endDate } },
      select: { id: true, timestamp: true, rating: true },
    }),
    prisma.sleep.findMany({
      where: { userId: user.id, timestamp: { gte: startDate, lte: endDate } },
      select: { id: true, timestamp: true, quality: true, bedtime: true, wakeTime: true },
    }),
    prisma.nutrition.findMany({
      where: { userId: user.id, timestamp: { gte: startDate, lte: endDate } },
      select: { id: true, timestamp: true, meal: true, calories: true },
    }),
  ]);

  // Convert to calendar events
  const events = [
    ...vitals.map((v) => ({
      id: `vital-${v.id}`,
      title: `❤️ Vitals${v.heartRate ? ` - ${v.heartRate} bpm` : ""}`,
      start: v.timestamp,
      end: v.timestamp,
      type: "vital",
      color: "#8b5cf6",
    })),
    ...medications.map((m) => ({
      id: `med-${m.id}`,
      title: `💊 ${m.name}${m.taken ? " ✓" : ""}`,
      start: m.timestamp,
      end: m.timestamp,
      type: "medication",
      color: m.taken ? "#22c55e" : "#f97066",
    })),
    ...workouts.map((w) => ({
      id: `workout-${w.id}`,
      title: `🏋️ ${w.type} - ${w.duration}min`,
      start: w.timestamp,
      end: w.timestamp,
      type: "workout",
      color: "#14b8a6",
    })),
    ...moods.map((m) => ({
      id: `mood-${m.id}`,
      title: `😊 Mood: ${m.rating}/10`,
      start: m.timestamp,
      end: m.timestamp,
      type: "mood",
      color: "#f59e0b",
    })),
    ...sleepLogs.map((s) => ({
      id: `sleep-${s.id}`,
      title: `😴 Sleep - Quality ${s.quality}/10`,
      start: s.bedtime,
      end: s.wakeTime,
      type: "sleep",
      color: "#6366f1",
    })),
    ...nutrition.map((n) => ({
      id: `nutrition-${n.id}`,
      title: `🥗 ${n.meal}${n.calories ? ` - ${n.calories} kcal` : ""}`,
      start: n.timestamp,
      end: n.timestamp,
      type: "nutrition",
      color: "#ec4899",
    })),
  ];

  return NextResponse.json({ events });
}

