import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const toCSV = (data: Record<string, any>[], headers: string[]): string => {
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      if (typeof val === "string" && val.includes(",")) return `"${val}"`;
      return String(val);
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";
  const type = searchParams.get("type") || "all";

  const [vitals, medications, workouts, moods, sleepLogs, nutrition] = await Promise.all([
    prisma.vital.findMany({ where: { userId: user.id }, orderBy: { timestamp: "desc" } }),
    prisma.medication.findMany({ where: { userId: user.id }, orderBy: { timestamp: "desc" } }),
    prisma.workout.findMany({ where: { userId: user.id }, orderBy: { timestamp: "desc" } }),
    prisma.mood.findMany({ where: { userId: user.id }, orderBy: { timestamp: "desc" } }),
    prisma.sleep.findMany({ where: { userId: user.id }, orderBy: { timestamp: "desc" } }),
    prisma.nutrition.findMany({ where: { userId: user.id }, orderBy: { timestamp: "desc" } }),
  ]);

  if (format === "json") {
    const data = {
      exportedAt: new Date().toISOString(),
      user: { name: user.name, email: user.email },
      ...(type === "all" || type === "vitals" ? { vitals } : {}),
      ...(type === "all" || type === "medications" ? { medications } : {}),
      ...(type === "all" || type === "workouts" ? { workouts } : {}),
      ...(type === "all" || type === "moods" ? { moods } : {}),
      ...(type === "all" || type === "sleep" ? { sleepLogs } : {}),
      ...(type === "all" || type === "nutrition" ? { nutrition } : {}),
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="health-journal-${type}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  }

  // CSV export
  let csv = "";
  let filename = "";

  switch (type) {
    case "vitals":
      csv = toCSV(vitals.map((v) => ({ ...v, timestamp: v.timestamp.toISOString() })), ["timestamp", "bloodPressureSystolic", "bloodPressureDiastolic", "heartRate", "temperature", "spO2", "notes"]);
      filename = "vitals";
      break;
    case "medications":
      csv = toCSV(medications.map((m) => ({ ...m, time: m.time.toISOString(), timestamp: m.timestamp.toISOString() })), ["timestamp", "name", "dosage", "time", "taken", "notes"]);
      filename = "medications";
      break;
    case "workouts":
      csv = toCSV(workouts.map((w) => ({ ...w, timestamp: w.timestamp.toISOString() })), ["timestamp", "type", "duration", "calories", "intensity", "notes"]);
      filename = "workouts";
      break;
    case "moods":
      csv = toCSV(moods.map((m) => ({ ...m, tags: m.tags.join("|"), timestamp: m.timestamp.toISOString() })), ["timestamp", "rating", "tags", "notes"]);
      filename = "moods";
      break;
    case "sleep":
      csv = toCSV(sleepLogs.map((s) => ({ ...s, bedtime: s.bedtime.toISOString(), wakeTime: s.wakeTime.toISOString(), timestamp: s.timestamp.toISOString() })), ["timestamp", "bedtime", "wakeTime", "quality", "notes"]);
      filename = "sleep";
      break;
    case "nutrition":
      csv = toCSV(nutrition.map((n) => ({ ...n, timestamp: n.timestamp.toISOString() })), ["timestamp", "meal", "calories", "protein", "carbs", "fats", "notes"]);
      filename = "nutrition";
      break;
    default:
      return NextResponse.json({ error: "For CSV, specify a type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="health-journal-${filename}-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

