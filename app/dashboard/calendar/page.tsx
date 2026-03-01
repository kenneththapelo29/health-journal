"use client";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: string;
  color: string;
}

interface DayEvents {
  [dateKey: string]: CalendarEvent[];
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  vital: "Vitals",
  medication: "Medication",
  workout: "Workout",
  mood: "Mood",
  sleep: "Sleep",
  nutrition: "Nutrition",
};

const LEGEND = [
  { type: "vital", color: "#8b5cf6", label: "Vitals" },
  { type: "medication", color: "#22c55e", label: "Medications" },
  { type: "workout", color: "#14b8a6", label: "Workouts" },
  { type: "mood", color: "#f59e0b", label: "Mood" },
  { type: "sleep", color: "#6366f1", label: "Sleep" },
  { type: "nutrition", color: "#ec4899", label: "Nutrition" },
];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async (month: Date) => {
    try {
      setIsLoading(true);
      const from = startOfMonth(month).toISOString();
      const to = endOfMonth(month).toISOString();
      const res = await fetch(`/api/calendar?from=${from}&to=${to}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEvents(data.events);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(currentMonth);
  }, [currentMonth, fetchEvents]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDay(new Date());
  };

  // Group events by date
  const eventsByDate: DayEvents = {};
  events.forEach((event) => {
    const key = format(new Date(event.start), "yyyy-MM-dd");
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(event);
  });

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const selectedDayKey = format(selectedDay, "yyyy-MM-dd");
  const selectedEvents = eventsByDate[selectedDayKey] || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">View all your health activities in one place</p>
          </div>
          <Button variant="outline" onClick={goToToday}>
            <Calendar className="mr-2 h-4 w-4" />
            Today
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                  {days.map((d, i) => {
                    const key = format(d, "yyyy-MM-dd");
                    const dayEvents = eventsByDate[key] || [];
                    const isCurrentMonth = isSameMonth(d, currentMonth);
                    const isSelected = isSameDay(d, selectedDay);
                    const isTodayDate = isToday(d);

                    // Get unique types for dot display
                    const uniqueTypes = [...new Set(dayEvents.map((e) => e.type))];

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDay(d)}
                        className={`
                          min-h-[80px] p-1.5 bg-card text-left transition-colors hover:bg-muted/50
                          ${!isCurrentMonth ? "opacity-40" : ""}
                          ${isSelected ? "ring-2 ring-primary ring-inset" : ""}
                        `}
                      >
                        <div className={`
                          text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1
                          ${isTodayDate ? "bg-primary text-primary-foreground" : ""}
                        `}>
                          {format(d, "d")}
                        </div>
                        {/* Event dots */}
                        <div className="flex flex-wrap gap-0.5">
                          {uniqueTypes.slice(0, 6).map((type) => {
                            const legend = LEGEND.find((l) => l.type === type);
                            return (
                              <div
                                key={type}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: legend?.color || "#888" }}
                              />
                            );
                          })}
                        </div>
                        {/* Event count */}
                        {dayEvents.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4">
                {LEGEND.map((item) => (
                  <div key={item.type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Events */}
          <Card>
            <CardHeader>
              <CardTitle>{format(selectedDay, "MMMM d, yyyy")}</CardTitle>
              <CardDescription>
                {selectedEvents.length > 0
                  ? `${selectedEvents.length} health event${selectedEvents.length !== 1 ? "s" : ""}`
                  : "No events logged"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No health data for this day.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border-l-4"
                      style={{ borderLeftColor: event.color }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {EVENT_TYPE_LABELS[event.type]} • {format(new Date(event.start), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Month Summary</CardTitle>
            <CardDescription>{format(currentMonth, "MMMM yyyy")} activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {LEGEND.map((item) => {
                const count = events.filter((e) => e.type === item.type).length;
                return (
                  <div key={item.type} className="text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: item.color }}
                    >
                      {count}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

