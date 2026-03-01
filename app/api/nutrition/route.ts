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
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Today's meals
  const todayNutrition = await prisma.nutrition.findMany({
    where: {
      userId: user.id,
      timestamp: { gte: startOfDay, lte: endOfDay },
    },
    orderBy: { timestamp: "asc" },
  });

  // Last 7 days for chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const allNutrition = await prisma.nutrition.findMany({
    where: {
      userId: user.id,
      timestamp: { gte: sevenDaysAgo },
    },
  });

  // Group by date for chart
  const chartMap: Record<string, { date: string; calories: number; protein: number; carbs: number; fats: number }> = {};
  allNutrition.forEach((n) => {
    const d = n.timestamp.toISOString().split("T")[0];
    if (!chartMap[d]) chartMap[d] = { date: d, calories: 0, protein: 0, carbs: 0, fats: 0 };
    chartMap[d].calories += n.calories || 0;
    chartMap[d].protein += n.protein || 0;
    chartMap[d].carbs += n.carbs || 0;
    chartMap[d].fats += n.fats || 0;
  });

  const chartData = Object.values(chartMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)
    .map((d) => ({
      ...d,
      protein: Math.round(d.protein * 10) / 10,
      carbs: Math.round(d.carbs * 10) / 10,
      fats: Math.round(d.fats * 10) / 10,
    }));

  return NextResponse.json({ todayNutrition, chartData });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { meal, calories, protein, carbs, fats, notes } = body;

  if (!meal) {
    return NextResponse.json({ error: "Meal name is required" }, { status: 400 });
  }

  const nutrition = await prisma.nutrition.create({
    data: {
      userId: user.id,
      meal,
      calories: calories ? parseInt(calories) : null,
      protein: protein ? parseFloat(protein) : null,
      carbs: carbs ? parseFloat(carbs) : null,
      fats: fats ? parseFloat(fats) : null,
      notes: notes || null,
    },
  });

  return NextResponse.json(nutrition, { status: 201 });
}

