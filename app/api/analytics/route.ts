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
  const days = parseInt(searchParams.get("days") || "30");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [vitals, medications, workouts, moods, sleepLogs, nutrition] = await Promise.all([
    prisma.vital.findMany({ where: { userId: user.id, timestamp: { gte: startDate } }, orderBy: { timestamp: "asc" } }),
    prisma.medication.findMany({ where: { userId: user.id, timestamp: { gte: startDate } } }),
    prisma.workout.findMany({ where: { userId: user.id, timestamp: { gte: startDate } }, orderBy: { timestamp: "asc" } }),
    prisma.mood.findMany({ where: { userId: user.id, timestamp: { gte: startDate } }, orderBy: { timestamp: "asc" } }),
    prisma.sleep.findMany({ where: { userId: user.id, timestamp: { gte: startDate } }, orderBy: { timestamp: "asc" } }),
    prisma.nutrition.findMany({ where: { userId: user.id, timestamp: { gte: startDate } } }),
  ]);

  // Daily aggregation helper
  const groupByDate = <T extends { timestamp: Date }>(items: T[], aggregator: (items: T[]) => Record<string, number>) => {
    const map: Record<string, T[]> = {};
    items.forEach((item) => {
      const d = item.timestamp.toISOString().split("T")[0];
      if (!map[d]) map[d] = [];
      map[d].push(item);
    });
    return Object.entries(map).map(([date, group]) => ({ date, ...aggregator(group) })).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Vitals trend
  const vitalsTrend = groupByDate(vitals, (group) => ({
    heartRate: Math.round(group.filter(v => v.heartRate).reduce((a, v) => a + (v.heartRate || 0), 0) / (group.filter(v => v.heartRate).length || 1)),
    systolic: Math.round(group.filter(v => v.bloodPressureSystolic).reduce((a, v) => a + (v.bloodPressureSystolic || 0), 0) / (group.filter(v => v.bloodPressureSystolic).length || 1)),
    spO2: Math.round(group.filter(v => v.spO2).reduce((a, v) => a + (v.spO2 || 0), 0) / (group.filter(v => v.spO2).length || 1)),
  }));

  // Mood trend
  const moodTrend = groupByDate(moods, (group) => ({
    avgMood: Math.round((group.reduce((a, m) => a + m.rating, 0) / group.length) * 10) / 10,
  }));

  // Sleep trend
  const sleepTrend = sleepLogs.map((s) => ({
    date: s.timestamp.toISOString().split("T")[0],
    duration: Math.round(((new Date(s.wakeTime).getTime() - new Date(s.bedtime).getTime()) / (1000 * 60 * 60)) * 10) / 10,
    quality: s.quality,
  }));

  // Workout trend
  const workoutTrend = groupByDate(workouts, (group) => ({
    duration: group.reduce((a, w) => a + w.duration, 0),
    calories: group.reduce((a, w) => a + (w.calories || 0), 0),
    count: group.length,
  }));

  // Nutrition trend
  const nutritionTrend = groupByDate(nutrition as any, (group: any[]) => ({
    calories: group.reduce((a: number, n: any) => a + (n.calories || 0), 0),
    protein: Math.round(group.reduce((a: number, n: any) => a + (n.protein || 0), 0) * 10) / 10,
    carbs: Math.round(group.reduce((a: number, n: any) => a + (n.carbs || 0), 0) * 10) / 10,
    fats: Math.round(group.reduce((a: number, n: any) => a + (n.fats || 0), 0) * 10) / 10,
  }));

  // Medication adherence
  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.taken).length;
  const adherenceRate = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;

  // Summary stats
  const summary = {
    totalWorkouts: workouts.length,
    totalCaloriesBurned: workouts.reduce((a, w) => a + (w.calories || 0), 0),
    avgSleepDuration: sleepTrend.length > 0 ? Math.round((sleepTrend.reduce((a, s) => a + s.duration, 0) / sleepTrend.length) * 10) / 10 : 0,
    avgMood: moods.length > 0 ? Math.round((moods.reduce((a, m) => a + m.rating, 0) / moods.length) * 10) / 10 : 0,
    medicationAdherence: adherenceRate,
    avgCaloriesPerDay: nutritionTrend.length > 0 ? Math.round(nutritionTrend.reduce((a: number, n: any) => a + (n.calories || 0), 0) / nutritionTrend.length) : 0,
  };

  return NextResponse.json({ vitalsTrend, moodTrend, sleepTrend, workoutTrend, nutritionTrend, summary });
}

