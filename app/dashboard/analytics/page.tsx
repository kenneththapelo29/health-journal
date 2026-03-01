"use client";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { Download, TrendingUp, Activity, Loader2, BarChart2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";

interface Summary {
  totalWorkouts: number;
  totalCaloriesBurned: number;
  avgSleepDuration: number;
  avgMood: number;
  medicationAdherence: number;
  avgCaloriesPerDay: number;
}

const formatDate = (d: string) => {
  try { return format(new Date(d), "MMM d"); } catch { return d; }
};

const EXPORT_TYPES = [
  { label: "All Data (JSON)", format: "json", type: "all" },
  { label: "Vitals (CSV)", format: "csv", type: "vitals" },
  { label: "Medications (CSV)", format: "csv", type: "medications" },
  { label: "Workouts (CSV)", format: "csv", type: "workouts" },
  { label: "Mood (CSV)", format: "csv", type: "moods" },
  { label: "Sleep (CSV)", format: "csv", type: "sleep" },
  { label: "Nutrition (CSV)", format: "csv", type: "nutrition" },
];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [vitalsTrend, setVitalsTrend] = useState<any[]>([]);
  const [moodTrend, setMoodTrend] = useState<any[]>([]);
  const [sleepTrend, setSleepTrend] = useState<any[]>([]);
  const [workoutTrend, setWorkoutTrend] = useState<any[]>([]);
  const [nutritionTrend, setNutritionTrend] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState("30");
  const [isExporting, setIsExporting] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/analytics?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSummary(data.summary);
      setVitalsTrend(data.vitalsTrend);
      setMoodTrend(data.moodTrend);
      setSleepTrend(data.sleepTrend);
      setWorkoutTrend(data.workoutTrend);
      setNutritionTrend(data.nutritionTrend);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = async (exportFormat: string, type: string) => {
    try {
      setIsExporting(true);
      const res = await fetch(`/api/export?format=${exportFormat}&type=${type}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `health-journal-${type}-${new Date().toISOString().split("T")[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Radar chart data from summary
  const radarData = summary
    ? [
        { metric: "Sleep", value: Math.min((summary.avgSleepDuration / 9) * 100, 100) },
        { metric: "Mood", value: (summary.avgMood / 10) * 100 },
        { metric: "Meds", value: summary.medicationAdherence },
        { metric: "Activity", value: Math.min((summary.totalWorkouts / (parseInt(days) / 7 * 5)) * 100, 100) },
        { metric: "Nutrition", value: summary.avgCaloriesPerDay > 0 ? Math.min((summary.avgCaloriesPerDay / 2000) * 100, 100) : 0 },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Comprehensive view of your health trends</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  {isExporting
                    ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    : <Download className="h-4 w-4 mr-2" />}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {EXPORT_TYPES.map((e) => (
                  <DropdownMenuItem
                    key={`${e.format}-${e.type}`}
                    onClick={() => handleExport(e.format, e.type)}
                  >
                    {e.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {summary && (
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {[
                  { label: "Workouts", value: summary.totalWorkouts, unit: "sessions", color: "text-teal-500" },
                  { label: "Calories Burned", value: summary.totalCaloriesBurned.toLocaleString(), unit: "kcal", color: "text-orange-500" },
                  { label: "Avg Sleep", value: `${summary.avgSleepDuration}h`, unit: "per night", color: "text-indigo-500" },
                  { label: "Avg Mood", value: `${summary.avgMood}/10`, unit: "rating", color: "text-yellow-500" },
                  { label: "Med Adherence", value: `${summary.medicationAdherence}%`, unit: "taken", color: "text-green-500" },
                  { label: "Avg Calories", value: summary.avgCaloriesPerDay.toLocaleString(), unit: "kcal/day", color: "text-pink-500" },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="pt-4">
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs font-medium mt-0.5">{stat.label}</div>
                      <div className="text-xs text-muted-foreground">{stat.unit}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Health Radar */}
            {radarData.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Health Score Radar</CardTitle>
                    <CardDescription>Overall health balance across all categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" />
                          <Radar name="Health" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                          <Tooltip formatter={(val: number) => `${Math.round(val)}%`} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Mood + Sleep overlay */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mood & Sleep Correlation</CardTitle>
                    <CardDescription>How sleep quality affects your mood</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[...moodTrend, ...sleepTrend].reduce((acc: any[], item) => {
                          const existing = acc.find((a) => a.date === item.date);
                          if (existing) { Object.assign(existing, item); }
                          else { acc.push({ ...item }); }
                          return acc;
                        }, []).sort((a, b) => a.date.localeCompare(b.date))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={formatDate} />
                          <YAxis domain={[0, 10]} />
                          <Tooltip labelFormatter={formatDate} />
                          <Legend />
                          <Line type="monotone" dataKey="avgMood" stroke="#f59e0b" strokeWidth={2} dot={false} name="Mood" />
                          <Line type="monotone" dataKey="quality" stroke="#6366f1" strokeWidth={2} dot={false} name="Sleep Quality" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Vitals Trend */}
            {vitalsTrend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Vitals Trend</CardTitle>
                  <CardDescription>Heart rate and blood pressure over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={vitalsTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatDate} />
                        <YAxis />
                        <Tooltip labelFormatter={formatDate} />
                        <Legend />
                        <Area type="monotone" dataKey="heartRate" stroke="#f97066" fill="#f97066" fillOpacity={0.1} name="Heart Rate (bpm)" />
                        <Area type="monotone" dataKey="systolic" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} name="Systolic BP" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Workout + Nutrition side by side */}
            <div className="grid gap-4 md:grid-cols-2">
              {workoutTrend.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Workout Activity</CardTitle>
                    <CardDescription>Duration and calories burned</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={workoutTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={formatDate} />
                          <YAxis />
                          <Tooltip labelFormatter={formatDate} />
                          <Legend />
                          <Bar dataKey="duration" fill="#14b8a6" name="Duration (min)" />
                          <Bar dataKey="calories" fill="#f97066" name="Calories" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {nutritionTrend.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nutrition Trend</CardTitle>
                    <CardDescription>Daily calorie and macro intake</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={nutritionTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={formatDate} />
                          <YAxis />
                          <Tooltip labelFormatter={formatDate} />
                          <Legend />
                          <Area type="monotone" dataKey="protein" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Protein (g)" />
                          <Area type="monotone" dataKey="carbs" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.2} name="Carbs (g)" />
                          <Area type="monotone" dataKey="fats" stroke="#f97066" fill="#f97066" fillOpacity={0.2} name="Fats (g)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sleep trend */}
            {sleepTrend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sleep Duration Trend</CardTitle>
                  <CardDescription>Hours of sleep per night (recommended: 7–9h)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sleepTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatDate} />
                        <YAxis domain={[0, 12]} />
                        <Tooltip labelFormatter={formatDate} />
                        <Legend />
                        <Area type="monotone" dataKey="duration" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="Sleep (hrs)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No data state */}
            {vitalsTrend.length === 0 && moodTrend.length === 0 && sleepTrend.length === 0 && workoutTrend.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No data yet</p>
                  <p className="text-sm">Start logging your health data to see trends here.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

