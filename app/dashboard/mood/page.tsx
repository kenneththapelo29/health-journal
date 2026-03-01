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
import { Plus, Smile, TrendingUp, Brain, Loader2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const SUGGESTED_TAGS = [
  "happy", "anxious", "calm", "stressed", "energetic",
  "tired", "grateful", "sad", "motivated", "overwhelmed",
  "focused", "irritable", "content", "lonely", "excited",
];

interface Mood {
  id: string;
  rating: number;
  notes: string | null;
  tags: string[];
  timestamp: string;
}

interface ChartData {
  date: string;
  avgRating: number;
  count: number;
}

interface TopTag {
  tag: string;
  count: number;
}

const getMoodLabel = (rating: number) => {
  if (rating <= 2) return { label: "Very Low", color: "text-red-500" };
  if (rating <= 4) return { label: "Low", color: "text-orange-500" };
  if (rating <= 6) return { label: "Moderate", color: "text-yellow-500" };
  if (rating <= 8) return { label: "Good", color: "text-blue-500" };
  return { label: "Excellent", color: "text-green-500" };
};

const getMoodEmoji = (rating: number) => {
  if (rating <= 2) return "😞";
  if (rating <= 4) return "😕";
  if (rating <= 6) return "😐";
  if (rating <= 8) return "🙂";
  return "😄";
};

export default function MoodPage() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topTags, setTopTags] = useState<TopTag[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    notes: "",
    tags: [] as string[],
    tagInput: "",
  });

  const fetchMoods = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/mood");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMoods(data.moods);
      setChartData(data.chartData);
      setTopTags(data.topTags);
    } catch (err) {
      console.error("Error fetching moods:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: formData.rating,
          notes: formData.notes,
          tags: formData.tags,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      await fetchMoods();
      setIsDialogOpen(false);
      setFormData({ rating: 5, notes: "", tags: [], tagInput: "" });
    } catch (err) {
      console.error("Error saving mood:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase();
    if (clean && !formData.tags.includes(clean)) {
      setFormData({ ...formData, tags: [...formData.tags, clean], tagInput: "" });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(formData.tagInput);
    }
  };

  // Derived stats
  const todayMoods = moods.filter(
    (m) => new Date(m.timestamp).toDateString() === new Date().toDateString()
  );
  const avgRatingToday =
    todayMoods.length > 0
      ? Math.round((todayMoods.reduce((acc, m) => acc + m.rating, 0) / todayMoods.length) * 10) / 10
      : null;

  const avgRatingWeek =
    moods.length > 0
      ? Math.round((moods.reduce((acc, m) => acc + m.rating, 0) / moods.length) * 10) / 10
      : null;

  const latestMood = moods[0];
  const formatChartDate = (d: any) => {
    try { return format(new Date(d), "MMM d"); } catch { return d; }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mood</h1>
            <p className="text-muted-foreground">Track your mental health and emotional wellbeing</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Log Mood
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Log Mood</DialogTitle>
                <DialogDescription>How are you feeling right now?</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* Rating Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Mood Rating</Label>
                    <span className="text-3xl">{getMoodEmoji(formData.rating)}</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[formData.rating]}
                    onValueChange={(val) => setFormData({ ...formData, rating: val[0] })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 - Very Low</span>
                    <span className={`font-bold text-sm ${getMoodLabel(formData.rating).color}`}>
                      {formData.rating}/10 — {getMoodLabel(formData.rating).label}
                    </span>
                    <span>10 - Excellent</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    placeholder="Type a tag and press Enter..."
                    value={formData.tagInput}
                    onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                    onKeyDown={handleTagKeyDown}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {SUGGESTED_TAGS.filter((t) => !formData.tags.includes(t)).slice(0, 8).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="px-2 py-1 rounded-full border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Journal Note (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="What's on your mind?"
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
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Mood</CardTitle>
              <Smile className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${latestMood ? getMoodLabel(latestMood.rating).color : ""}`}>
                {isLoading ? "—" : latestMood ? `${latestMood.rating}/10 ${getMoodEmoji(latestMood.rating)}` : "Not logged"}
              </div>
              <p className="text-xs text-muted-foreground">
                {latestMood ? getMoodLabel(latestMood.rating).label : "Log your first mood"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Average</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "—" : avgRatingToday !== null ? `${avgRatingToday}/10` : "—"}
              </div>
              <p className="text-xs text-muted-foreground">{todayMoods.length} log{todayMoods.length !== 1 ? "s" : ""} today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "—" : avgRatingWeek !== null ? `${avgRatingWeek}/10` : "—"}
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mood Trends</CardTitle>
              <CardDescription>Your average mood rating over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatChartDate} />
                    <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                    <Tooltip labelFormatter={formatChartDate} />
                    <ReferenceLine y={5} stroke="#e5e7eb" strokeDasharray="4 4" label="Neutral" />
                    <Line
                      type="monotone"
                      dataKey="avgRating"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Avg Mood"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {/* Top Tags */}
          {topTags.length > 0 && (
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Top Feelings</CardTitle>
                <CardDescription>Most frequent tags this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topTags.map(({ tag, count }) => (
                    <div key={tag} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{tag}</span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {count}x
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Entries */}
          <Card className={topTags.length > 0 ? "md:col-span-2" : "md:col-span-3"}>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
              <CardDescription>Your mood log for the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : moods.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Smile className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No mood logs yet.</p>
                  <p className="text-sm">Click "Log Mood" to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moods.map((mood) => {
                      const { label, color } = getMoodLabel(mood.rating);
                      return (
                        <TableRow key={mood.id}>
                          <TableCell>{format(new Date(mood.timestamp), "MMM d, h:mm a")}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${color}`}>
                              {getMoodEmoji(mood.rating)} {mood.rating}/10
                            </span>
                            <span className="ml-1 text-xs text-muted-foreground">({label})</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {mood.tags.length > 0
                                ? mood.tags.map((tag) => (
                                    <span key={tag} className="px-1.5 py-0.5 rounded-full bg-muted text-xs">
                                      {tag}
                                    </span>
                                  ))
                                : <span className="text-muted-foreground">—</span>
                              }
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate text-muted-foreground">
                            {mood.notes || "—"}
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
      </div>
    </DashboardLayout>
  );
}

