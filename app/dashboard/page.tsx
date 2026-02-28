import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Pill, 
  Dumbbell, 
  Brain, 
  Moon, 
  UtensilsCrossed,
  Calendar,
  Plus,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import Link from "next/link";

const healthCards = [
  {
    title: "Vitals",
    description: "Blood pressure, heart rate, temperature",
    icon: Activity,
    href: "/dashboard/vitals",
    color: "text-primary",
    bgColor: "bg-primary/10",
    stats: "Last: 120/80 mmHg",
    trend: "stable",
  },
  {
    title: "Medications",
    description: "Track your daily medications",
    icon: Pill,
    href: "/dashboard/medications",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    stats: "3/4 taken today",
    trend: "up",
  },
  {
    title: "Workouts",
    description: "Exercise and fitness tracking",
    icon: Dumbbell,
    href: "/dashboard/workouts",
    color: "text-accent",
    bgColor: "bg-accent/10",
    stats: "45 min today",
    trend: "up",
  },
  {
    title: "Mood",
    description: "Mental health and mood tracking",
    icon: Brain,
    href: "/dashboard/mood",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    stats: "Rating: 8/10",
    trend: "stable",
  },
  {
    title: "Sleep",
    description: "Sleep quality and duration",
    icon: Moon,
    href: "/dashboard/sleep",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    stats: "7.5 hours last night",
    trend: "up",
  },
  {
    title: "Nutrition",
    description: "Diet and calorie tracking",
    icon: UtensilsCrossed,
    href: "/dashboard/nutrition",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    stats: "1,850 cal today",
    trend: "down",
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your health overview.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {healthCards.map((card) => {
            const Icon = card.icon;
            const TrendIcon = card.trend === "up" ? TrendingUp : card.trend === "down" ? TrendingDown : Activity;
            
            return (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <div className={`flex items-center text-xs ${
                      card.trend === "up" ? "text-green-500" : 
                      card.trend === "down" ? "text-red-500" : 
                      "text-muted-foreground"
                    }`}>
                      <TrendIcon className="h-3 w-3 mr-1" />
                      {card.trend === "stable" ? "Stable" : card.trend === "up" ? "+12%" : "-5%"}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.title}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.description}
                    </p>
                    <div className="mt-4 text-sm font-medium">
                      {card.stats}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Activity
              </CardTitle>
              <CardDescription>Your health activities for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Blood pressure recorded</p>
                    <p className="text-xs text-muted-foreground">8:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Morning medication taken</p>
                    <p className="text-xs text-muted-foreground">8:30 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Workout completed</p>
                    <p className="text-xs text-muted-foreground">7:00 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Add new health entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/dashboard/vitals">
                    <Plus className="h-5 w-5" />
                    <span>Add Vitals</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/dashboard/medications">
                    <Plus className="h-5 w-5" />
                    <span>Add Medication</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/dashboard/workouts">
                    <Plus className="h-5 w-5" />
                    <span>Log Workout</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/dashboard/mood">
                    <Plus className="h-5 w-5" />
                    <span>Log Mood</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
