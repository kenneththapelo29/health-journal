import { Activity, Heart, Moon, Dumbbell, Pill, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Health Journal</span>
          </div>
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-32">
        <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
          <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">
            Your personal health tracking dashboard.
          </h2>
          <div className="relative">
            <div className="relative z-10 space-y-4 md:w-1/2">
              <p>
                Health Journal brings together <span className="font-medium">all your health data in one place</span> — from vitals to nutrition, sleep to mood.
              </p>
              <p>
                Track your progress, spot trends, and take control of your wellbeing with beautiful charts and insights.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Heart className="size-4 text-primary" />
                    <h3 className="text-sm font-medium">Track Everything</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">Vitals, sleep, mood, workouts, nutrition and medications all in one app.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-primary" />
                    <h3 className="text-sm font-medium">See Trends</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">Beautiful charts and analytics to help you understand your health patterns.</p>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <Button asChild size="lg">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </div>

            {/* Feature grid */}
            <div className="mt-12 md:absolute md:-inset-y-12 md:right-0 md:w-1/2 md:mt-0">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Heart, label: "Vitals", desc: "BP, HR, SpO2" },
                  { icon: Pill, label: "Medications", desc: "Adherence tracking" },
                  { icon: Dumbbell, label: "Workouts", desc: "Fitness logging" },
                  { icon: Moon, label: "Sleep", desc: "Quality & duration" },
                  { icon: Activity, label: "Mood", desc: "Mental wellness" },
                  { icon: UtensilsCrossed, label: "Nutrition", desc: "Calorie & macros" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <item.icon className="size-4 text-primary" />
                      <h3 className="text-sm font-medium">{item.label}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
