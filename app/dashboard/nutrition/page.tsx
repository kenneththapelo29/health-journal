"use client";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Utensils, Flame, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Pre-workout", "Post-workout", "Other"];

const CALORIE_GOAL = 2000;
const PROTEIN_GOAL = 150;
const CARBS_GOAL = 250;
const FATS_GOAL = 65;

const MACRO_COLORS = {
  protein: "#8b5cf6",
  carbs: "#14b8a6",
  fats: "#f97066",
};

interface NutritionEntry {
  id: string;
  meal: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  notes: string | null;
  timestamp: string;
}

interface ChartData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function NutritionPage() {
  const [todayNutrition, setTodayNutrition] = useState<NutritionEntry[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    meal: "",
    mealType: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    notes: "",
  });

  const fetchNutrition = useCallback(async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/nutrition?date=${today}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTodayNutrition(data.todayNutrition);
      setChartData(data.chartData);
    } catch (err) {
      console.error("Error fetching nutrition:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNutrition();
  }, [fetchNutrition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const mealName = formData.mealType
        ? `${formData.mealType}${formData.meal ? ` - ${formData.meal}` : ""}`
        : formData.meal;

      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, meal: mealName }),
      });
      if (!res.ok) throw new Error("Failed to save");
      await fetchNutrition();
      setIsDialogOpen(false);
      setFormData({ meal: "", mealType: "", calories: "", protein: "", carbs: "", fats: "", notes: "" });
    } catch (err) {
      console.error("Error saving nutrition:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Today's totals
  const totals = todayNutrition.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.calories || 0),
      protein: acc.protein + (entry.protein || 0),
      carbs: acc.carbs + (entry.carbs || 0),
      fats: acc.fats + (entry.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const macroData = [
    { name: "Protein", value: Math.round(totals.protein), goal: PROTEIN_GOAL, color: MACRO_COLORS.protein },
    { name: "Carbs", value: Math.round(totals.carbs), goal: CARBS_GOAL, color: MACRO_COLORS.carbs },
    { name: "Fats", value: Math.round(totals.fats), goal: FATS_GOAL, color: MACRO_COLORS.fats },
  ];

  const pieData = macroData.map((m) => ({ name: m.name, value: m.value }));

  const formatChartDate = (d: string) => {
    try { return format(new Date(d), "MMM d"); } catch { return d; }
  };

  const caloriePercent = Math.min(Math.round((totals.calories / CALORIE_GOAL) * 100), 100);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nutrition</h1>
            <p className="text-muted-foreground">Track your meals, calories, and macros</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Log Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Log Meal</DialogTitle>
                <DialogDescription>Record what you ate.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meal Type</Label>
                    <Select
                      value={formData.mealType}
                      onValueChange={(val) => setFormData({ ...formData, mealType: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEAL_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meal">Food / Description</Label>
                    <Input
                      id="meal"
                      placeholder="e.g., Chicken salad"
                      value={formData.meal}
                      onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="e.g., 450"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="protein" className="text-purple-600 dark:text-purple-400">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.1"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs" className="text-teal-600 dark:text-teal-400">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.1"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fats" className="text-coral-600" style={{ color: "#f97066" }}>Fats (g)</Label>
                    <Input
                      id="fats"
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.1"
                      value={formData.fats}
                      onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="e.g., Homemade, restaurant name..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || (!formData.meal && !formData.mealType)}>
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Save
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calorie Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Calories</CardTitle>
            <CardDescription>{format(new Date(), "EEEE, MMMM d")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{isLoading ? "—" : totals.calories} kcal</span>
                <span className="text-muted-foreground">Goal: {CALORIE_GOAL} kcal</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    caloriePercent >= 100 ? "bg-red-500" : caloriePercent >= 75 ? "bg-green-500" : "bg-primary"
                  }`}
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {CALORIE_GOAL - totals.calories > 0
                  ? `${CALORIE_GOAL - totals.calories} kcal remaining`
                  : `${totals.calories - CALORIE_GOAL} kcal over goal`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Macro Cards + Pie Chart */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-4 grid-cols-1">
            {macroData.map((macro) => (
              <Card key={macro.name}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: macro.color }}>{macro.name}</span>
                    <span className="text-sm text-muted-foreground">{macro.value}g / {macro.goal}g</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((macro.value / macro.goal) * 100, 100)}%`,
                        backgroundColor: macro.color,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pie chart */}
          <Card>
            <CardHeader>
              <CardTitle>Macro Breakdown</CardTitle>
              <CardDescription>Today's macro distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {totals.protein + totals.carbs + totals.fats > 0 ? (
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={Object.values(MACRO_COLORS)[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `${val}g`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
                  Log meals to see macro breakdown
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Calories Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Nutrition</CardTitle>
              <CardDescription>Calories and macros over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatChartDate} />
                    <YAxis />
                    <Tooltip labelFormatter={formatChartDate} />
                    <Legend />
                    <Bar dataKey="calories" fill="#f59e0b" name="Calories" />
                    <Bar dataKey="protein" fill={MACRO_COLORS.protein} name="Protein (g)" />
                    <Bar dataKey="carbs" fill={MACRO_COLORS.carbs} name="Carbs (g)" />
                    <Bar dataKey="fats" fill={MACRO_COLORS.fats} name="Fats (g)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Meals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Meals</CardTitle>
            <CardDescription>{format(new Date(), "EEEE, MMMM d")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : todayNutrition.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No meals logged today.</p>
                <p className="text-sm">Click "Log Meal" to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Meal</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead style={{ color: MACRO_COLORS.protein }}>Protein</TableHead>
                    <TableHead style={{ color: MACRO_COLORS.carbs }}>Carbs</TableHead>
                    <TableHead style={{ color: MACRO_COLORS.fats }}>Fats</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayNutrition.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(entry.timestamp), "h:mm a")}
                      </TableCell>
                      <TableCell className="font-medium">{entry.meal}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {entry.calories ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>{entry.protein !== null ? `${entry.protein}g` : "—"}</TableCell>
                      <TableCell>{entry.carbs !== null ? `${entry.carbs}g` : "—"}</TableCell>
                      <TableCell>{entry.fats !== null ? `${entry.fats}g` : "—"}</TableCell>
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <TableRow className="font-bold border-t-2">
                    <TableCell colSpan={2}>Daily Total</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {totals.calories}
                      </span>
                    </TableCell>
                    <TableCell>{Math.round(totals.protein)}g</TableCell>
                    <TableCell>{Math.round(totals.carbs)}g</TableCell>
                    <TableCell>{Math.round(totals.fats)}g</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

