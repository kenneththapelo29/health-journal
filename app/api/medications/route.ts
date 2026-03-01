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

  // Get today's medications
  const medications = await prisma.medication.findMany({
    where: {
      userId: user.id,
      timestamp: { gte: startOfDay, lte: endOfDay },
    },
    orderBy: { time: "asc" },
  });

  // Get last 7 days adherence data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const allMeds = await prisma.medication.findMany({
    where: {
      userId: user.id,
      timestamp: { gte: sevenDaysAgo },
    },
  });

  // Group by date for adherence chart
  const adherenceMap: Record<string, { taken: number; prescribed: number }> = {};
  allMeds.forEach((med) => {
    const d = med.timestamp.toISOString().split("T")[0];
    if (!adherenceMap[d]) adherenceMap[d] = { taken: 0, prescribed: 0 };
    adherenceMap[d].prescribed++;
    if (med.taken) adherenceMap[d].taken++;
  });

  const adherenceData = Object.entries(adherenceMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-5);

  return NextResponse.json({ medications, adherenceData });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { name, dosage, time, notes } = body;

  if (!name || !dosage || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Parse time string (HH:mm) into today's date
  const [hours, minutes] = time.split(":").map(Number);
  const medicationTime = new Date();
  medicationTime.setHours(hours, minutes, 0, 0);

  const medication = await prisma.medication.create({
    data: {
      userId: user.id,
      name,
      dosage,
      time: medicationTime,
      notes: notes || null,
      taken: false,
    },
  });

  return NextResponse.json(medication, { status: 201 });
}

