"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCurrentUser,
  logout,
  getHealthEntries,
  createHealthEntry,
  HealthEntry,
} from "@/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
    sleep: "",
    calories: "",
    steps: "",
    mood: "5",
    notes: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }
      const data = await getHealthEntries();
      setEntries(data);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const entry = await createHealthEntry({
        date: formData.date,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        sleep: formData.sleep ? parseFloat(formData.sleep) : undefined,
        calories: formData.calories ? parseInt(formData.calories) : undefined,
        steps: formData.steps ? parseInt(formData.steps) : undefined,
        mood: formData.mood ? parseInt(formData.mood) : undefined,
        notes: formData.notes || undefined,
      });

      setEntries([entry, ...entries]);
      setMessage("Entry saved successfully!");

      setFormData({
        date: new Date().toISOString().split("T")[0],
        weight: "",
        sleep: "",
        calories: "",
        steps: "",
        mood: "5",
        notes: "",
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Health Journal</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add Entry</CardTitle>
              <CardDescription>Track your daily health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <div
                    className={`p-3 text-sm rounded-md ${
                      message.includes("success")
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {message}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70.5"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleep">Sleep (hrs)</Label>
                    <Input
                      id="sleep"
                      type="number"
                      step="0.5"
                      placeholder="7.5"
                      value={formData.sleep}
                      onChange={(e) =>
                        setFormData({ ...formData, sleep: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="2000"
                      value={formData.calories}
                      onChange={(e) =>
                        setFormData({ ...formData, calories: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="steps">Steps</Label>
                    <Input
                      id="steps"
                      type="number"
                      placeholder="10000"
                      value={formData.steps}
                      onChange={(e) =>
                        setFormData({ ...formData, steps: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mood">Mood (1-10)</Label>
                  <Input
                    id="mood"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.mood}
                    onChange={(e) =>
                      setFormData({ ...formData, mood: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="How are you feeling?"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Saving..." : "Save Entry"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
              <CardDescription>Your health history</CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No entries yet. Start tracking your health!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Weight</th>
                        <th className="text-left p-2">Sleep</th>
                        <th className="text-left p-2">Calories</th>
                        <th className="text-left p-2">Steps</th>
                        <th className="text-left p-2">Mood</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry.id} className="border-b">
                          <td className="p-2">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="p-2">{entry.weight ?? "-"}</td>
                          <td className="p-2">{entry.sleep ?? "-"}</td>
                          <td className="p-2">{entry.calories ?? "-"}</td>
                          <td className="p-2">{entry.steps ?? "-"}</td>
                          <td className="p-2">{entry.mood ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
