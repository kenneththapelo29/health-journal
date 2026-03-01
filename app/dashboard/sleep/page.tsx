"use client";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Moon, Sun, Clock, TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SleepLog {
  id: string;
  bedtime: string;
  wakeTime: string;
  quality: number;
  notes: string | null;
  timestamp: string;
}

interface ChartData {
  date: string;
  duration: number;
  quality: number;
}

const getQualityLabel = (quality: number) => {
  if (quality <= 2) return { label: "Very Poor", color: "text-red-500" };
  if (quality <= 4) return { label: "Poor", color: "text-orange-500" };
  if (quality <= 6) return { label: "Fair", color: "text-yellow-500" };
  if (quality <= 8) return { label: "Good", color: "text-blue-500" };
  return { label: "Excellent", color: "text-green-500" };
};

const getDurationColor = (hours: number) => {
  if (hours < 6) return "text-red-500";
  if (hours < 7) return "text-orange-500";
  if (hours <= 9) return "text-green-500";
  return "text-blue-500";
};

export default function SleepPage() {
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [avgDuration, setAvgDuration] = useState<number>(0);
  const [avgQuality, setAvgQuality] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bedtime: "",
    wakeTime: "",
    quality: 7,
    notes: "",
  });

  const fetchSleep = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/sleep");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSleepLogs(data.sleepLogs);
      setChartData(data.chartData);
      setAvgDuration(data.avgDuration);
      setAvgQuality(data.avgQuality);
    } catch (err) {
      console.error("Error fetching sleep logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSleep();
  }, [fetchSleep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save");
      await fetchSleep();
      setIsDialogOpen(false);
      setFormData({ bedtime: "", wakeTime: "", quality: 7, notes: "" });
    } catch (err) {
      console.error("Error saving sleep log:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calcDuration = (bedtime: string, wakeTime: string) => {
    if (!bedtime || !wakeTime) return null;
    let diff = (new Date(wakeTime).getTime() - new Date(bedtime).getTime()) / (1000 * 60 * 60);
    if (diff < 0) diff += 24;
    return Math.round(diff * 10) / 10;
  };

  const latestLog = sleepLogs[0];
  const latestDuration = latestLog ? calcDuration(latestLog.bedtime, latestLog.wakeTime) : null;

  const formatChartDate = (d: string) => {
    try { return format(new Date(d), "MMM d"); } catch { return d; }
  };

  // Set default bedtime/waketime for form
  const getDefaultTimes = () => {
    const now = new Date();
    const lastNight = new Date(now);
    lastNight.setDate(lastNight.getDate() - 1);
    lastNight.setHours(22, 0, 0, 0);
    const thisAM = new Date(now);
    thisAM.setHours(6, 0, 0, 0);
    return {
      bedtime: lastNight.toISOString().slice(0, 16),
      wakeTime: thisAM.toISOString().slice(0, 16),
    };
  };

  const handleOpenDialog = () => {
    const defaults = getDefaultTimes();
    setFormData((prev) => ({
      ...prev,
      bedtime: prev.bedtime || defaults.bedtime,
      wakeTime: prev.wakeTime || defaults.wakeTime,
    }));
    setIsDialogOpen(true);
  };

  const previewDuration = calcDuration(formData.bedtime, formData.wakeTime);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sleep</h1>
            <p className="text-muted-foreground">Track your sleep patterns and quality</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Log Sleep
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Log Sleep</DialogTitle>
                <DialogDescription>Record your sleep session.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedtime">
                      <Moon className="inline h-3 w-3 mr-1" />
                      Bedtime
                    </Label>
                    <Input
                      id="bedtime"
                      type="datetime-local"
                      value={formData.bedtime}
                      onChange={(e) => setFormData({ ...formData, bedtime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wakeTime">
                      <Sun className="inline h-3 w-3 mr-1" />
                      Wake Time
                    </Label>
                    <Input
                      id="wakeTime"
                      type="datetime-local"
                      value={formData.wakeTime}
                      onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Duration preview */}
                {previewDuration !== null && (
                  <div className={`text-center text-sm font-medium ${getDurationColor(previewDuration)}`}>
                    Sleep duration: {previewDuration} hours
                    {previewDuration < 7 ? " ⚠️ Below recommended" : " ✓ Good"}
                  </div>
                )}

                {/* Quality Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Sleep Quality</Label>
                    <span className={`text-sm font-bold ${getQualityLabel(formData.quality).color}`}>
                      {formData.quality}/10 — {getQualityLabel(formData.quality).label}
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[formData.quality]}
                    onValueChange={(val) => setFormData({ ...formData, quality: val[0] })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 - Very Poor</span>
                    <span>10 - Excellent</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="e.g., Woke up twice, vivid dreams..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Save
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Night</CardTitle>
              <Moon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${latestDuration !== null ? getDurationColor(latestDuration) : ""}`}>
                {isLoading ? "—" : latestDuration !== null ? `${latestDuration}h` : "Not logged"}
              </div>
              <p className="text-xs text-muted-foreground">
                {latestLog ? `Quality: ${latestLog.quality}/10` : "Log your sleep"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${avgDuration ? getDurationColor(avgDuration) : ""}`}>
                {isLoading ? "—" : avgDuration ? `${avgDuration}h` : "—"}
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${avgQuality ? getQualityLabel(avgQuality).color : ""}`}>
                {isLoading ? "—" : avgQuality ? `${avgQuality}/10` : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {avgQuality ? getQualityLabel(avgQuality).label : "Last 7 days"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sleep Goal</CardTitle>
              <Sun className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${avgDuration >= 7 ? "text-green-500" : "text-orange-500"}`}>
                {isLoading ? "—" : avgDuration >= 7 ? "On Track ✓" : "Below Goal"}
              </div>
              <p className="text-xs text-muted-foreground">Target: 7–9 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sleep Trends</CardTitle>
              <CardDescription>Duration and quality over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatChartDate} />
                    <YAxis yAxisId="left" domain={[0, 12]} label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 10]} label={{ value: "Quality", angle: 90, position: "insideRight" }} />
                    <Tooltip labelFormatter={formatChartDate} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="duration" fill="#8b5cf6" name="Duration (hrs)" opacity={0.8} />
                    <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4 }} name="Quality (1-10)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sleep History</CardTitle>
            <CardDescription>Your sleep logs for the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sleepLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Moon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No sleep logs yet.</p>
                <p className="text-sm">Click "Log Sleep" to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Bedtime</TableHead>
                    <TableHead>Wake Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sleepLogs.map((log) => {
                    const duration = calcDuration(log.bedtime, log.wakeTime);
                    const { label, color } = getQualityLabel(log.quality);
                    return (
                      <TableRow key={log.id}>
                        <TableCell>{format(new Date(log.timestamp), "MMM d")}</TableCell>
                        <TableCell>{format(new Date(log.bedtime), "h:mm a")}</TableCell>
                        <TableCell>{format(new Date(log.wakeTime), "h:mm a")}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${duration !== null ? getDurationColor(duration) : ""}`}>
                            {duration !== null ? `${duration}h` : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${color}`}>
                            {log.quality}/10
                          </span>
                          <span className="ml-1 text-xs text-muted-foreground">({label})</span>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate text-muted-foreground">
                          {log.notes || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

