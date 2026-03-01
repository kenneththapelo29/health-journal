"use client";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pill, Clock, CheckCircle2, Circle, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string; // ISO string
  taken: boolean;
  timestamp: string;
  notes?: string;
}

interface AdherenceData {
  date: string;
  taken: number;
  prescribed: number;
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [adherenceData, setAdherenceData] = useState<AdherenceData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", dosage: "", time: "", notes: "" });

  const fetchMedications = useCallback(async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/medications?date=${today}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMedications(data.medications);
      setAdherenceData(data.adherenceData);
    } catch (err) {
      console.error("Error fetching medications:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save");
      await fetchMedications();
      setIsDialogOpen(false);
      setFormData({ name: "", dosage: "", time: "", notes: "" });
    } catch (err) {
      console.error("Error saving medication:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTaken = async (id: string, currentTaken: boolean) => {
    try {
      setTogglingId(id);
      // Optimistic update
      setMedications((prev) =>
        prev.map((m) => (m.id === id ? { ...m, taken: !currentTaken } : m))
      );
      const res = await fetch(`/api/medications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taken: !currentTaken }),
      });
      if (!res.ok) {
        // Revert on failure
        setMedications((prev) =>
          prev.map((m) => (m.id === id ? { ...m, taken: currentTaken } : m))
        );
      }
    } catch (err) {
      console.error("Error toggling medication:", err);
      setMedications((prev) =>
        prev.map((m) => (m.id === id ? { ...m, taken: currentTaken } : m))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/medications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setMedications((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Error deleting medication:", err);
    }
  };

  // Derived stats
  const takenCount = medications.filter((m) => m.taken).length;
  const totalCount = medications.length;

  const adherenceRate =
    adherenceData.length > 0
      ? Math.round(
          (adherenceData.reduce((acc, d) => acc + d.taken, 0) /
            adherenceData.reduce((acc, d) => acc + d.prescribed, 0)) *
            100
        )
      : 0;

  const nextMed = medications
    .filter((m) => !m.taken)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0];

  const formatTime = (iso: string) => {
    try {
      return format(new Date(iso), "hh:mm a");
    } catch {
      return iso;
    }
  };

  const formatChartDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d");
    } catch {
      return dateStr;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
            <p className="text-muted-foreground">Track your daily medications and supplements</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Medication</DialogTitle>
                <DialogDescription>Record a new medication or supplement for today.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medication Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Vitamin D"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 1000 IU"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Scheduled Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="e.g., Take with food"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
              <CardTitle className="text-sm font-medium">Adherence Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adherenceRate}%</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "—" : `${takenCount}/${totalCount}`}
              </div>
              <p className="text-xs text-muted-foreground">Medications taken</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Dose</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "—" : nextMed ? formatTime(nextMed.time) : "All done!"}
              </div>
              <p className="text-xs text-muted-foreground">
                {nextMed ? nextMed.name : "No pending doses"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Adherence Chart */}
        {adherenceData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Adherence Chart</CardTitle>
              <CardDescription>Medication adherence over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adherenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatChartDate} />
                    <YAxis allowDecimals={false} />
                    <Tooltip labelFormatter={formatChartDate} />
                    <Legend />
                    <Bar dataKey="prescribed" fill="#e5e7eb" name="Prescribed" />
                    <Bar dataKey="taken" fill="#22c55e" name="Taken" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Medications */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Medications</CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, MMMM d")} — tap to mark as taken
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : medications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No medications logged today.</p>
                <p className="text-sm">Click "Add Medication" to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => (
                  <div
                    key={med.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      med.taken
                        ? "bg-muted border-muted"
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        id={med.id}
                        checked={med.taken}
                        disabled={togglingId === med.id}
                        onCheckedChange={() => handleToggleTaken(med.id, med.taken)}
                        className="h-5 w-5"
                      />
                      <div>
                        <Label
                          htmlFor={med.id}
                          className={`text-sm font-medium cursor-pointer ${
                            med.taken ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {med.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {med.dosage} • {formatTime(med.time)}
                          {med.notes && ` • ${med.notes}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {togglingId === med.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : med.taken ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(med.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Table */}
        {medications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Log</CardTitle>
              <CardDescription>Full details for today's medications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium">{med.name}</TableCell>
                      <TableCell>{med.dosage}</TableCell>
                      <TableCell>{formatTime(med.time)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                            med.taken
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {med.taken ? (
                            <><CheckCircle2 className="h-3 w-3" /> Taken</>
                          ) : (
                            <><Circle className="h-3 w-3" /> Pending</>
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

