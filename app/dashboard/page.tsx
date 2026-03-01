import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity, Pill, Dumbbell, Brain, Moon, UtensilsCrossed,
  Calendar, Plus, TrendingUp, TrendingDown
} from "lucide-react";
import Link from "next/link";

const healthCards = [
  { title: "Vitals", description: "Blood pressure, heart rate, temperature", icon: Activity, href: "/dashboard/vitals", color: "text-primary", bgColor: "bg-primary/10", stats: "Track your vitals", trend: "stable" },
  { title: "Medications", description: "Track your daily medications", icon: Pill, href: "/dashboard/medications", color: "text-secondary", bgColor: "bg-secondary/10", stats: "Mark medications taken", trend: "up" },
  { title: "Workouts", description: "Exercise and fitness tracking", icon: Dumbbell, href: "/dashboard/workouts", color: "text-accent", bgColor: "bg-accent/10", stats: "Log your workouts", trend: "up" },
  { title: "Mood", description: "Mental health and mood tracking", icon: Brain, href: "/dashboard/mood", color: "text-chart-4", bgColor: "bg-chart-4/10", stats: "Rate your mood", trend: "stable" },
  { title: "Sleep", description: "Sleep quality and duration", icon: Moon, href: "/dashboard/sleep", color: "text-chart-2", bgColor: "bg-chart-2/10", stats: "Track your sleep", trend: "up" },
  { title: "Nutrition", description: "Diet and calorie tracking", icon: UtensilsCrossed, href: "/dashboard/nutrition", color: "text-chart-5", bgColor: "bg-chart-5/10", stats: "Log your meals", trend: "down" },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name?.split(" ")[0] || "there"}! Here's your health overview.
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
                    <div className={`flex items-center text-xs ${card.trend === "up" ? "text-green-500" : card.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                      <TrendIcon className="h-3 w-3 mr-1" />
                      {card.trend === "stable" ? "Stable" : card.trend === "up" ? "+12%" : "-5%"}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.title}</div>
                    <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                    <div className="mt-4 text-sm font-medium">{card.stats}</div>
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
              <p className="text-sm text-muted-foreground text-center py-4">
                Start logging to see your activity here.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Add new health entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: "/dashboard/vitals", label: "Add Vitals" },
                  { href: "/dashboard/medications", label: "Add Medication" },
                  { href: "/dashboard/workouts", label: "Log Workout" },
                  { href: "/dashboard/mood", label: "Log Mood" },
                ].map((action) => (
                  <Button key={action.href} variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                    <Link href={action.href}>
                      <Plus className="h-5 w-5" />
                      <span>{action.label}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
