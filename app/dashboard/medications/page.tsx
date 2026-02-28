"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pill, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockMedicationsData = [
  { date: "2024-01-20", taken: 4, prescribed: 4 },
  { date: "2024-01-21", taken: 3, prescribed: 4 },
  { date: "2024-01-22", taken: 4, prescribed: 4 },
  { date: "2024-01-23", taken: 4, prescribed: 4 },
  { date: "2024-01-24", taken: 3, prescribed: 4 },
];

const mockMedications = [
  { id: "1", name: "Vitamin D", dosage: "1000 IU", time: "08:00", taken: true, timestamp: new Date("2024-01-24T08:00:00") },
  { id: "2", name: "Omega-3", dosage: "1000mg", time: "08:00", taken: true, timestamp: new Date("2024-01-24T08:00:00") },
  { id: "3", name: "Multivitamin", dosage: "1 tablet", time: "12:00", taken: false, timestamp: new Date("2024-01-24T12:00:00") },
  { id: "4", name: "Magnesium", dosage: "400mg", time: "20:00", taken: false, timestamp: new Date("2024-01-24T20:00:00") },
];

export default function MedicationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    time: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting:", formData);
    setIsDialogOpen(false);
    setFormData({ name: "", dosage: "", time: "" });
  };

  const adherenceRate = Math.round(
    (mockMedicationsData.reduce((acc, day) => acc + day.taken, 0) / 
     mockMedicationsData.reduce((acc, day) => acc + day.prescribed, 0)) * 100
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
                <DialogDescription>Record a new medication or supplement.</DialogDescription>
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
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adherence Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adherenceRate}%</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2/4</div>
              <p className="text-xs text-muted-foreground">
                Medications taken
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Dose</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12:00 PM</div>
              <p className="text-xs text-muted-foreground">
                Multivitamin
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Adherence Chart</CardTitle>
            <CardDescription>Medication adherence over the past 5 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockMedicationsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="taken" fill="#22c55e" name="Taken" />
                  <Bar dataKey="prescribed" fill="#e5e7eb" name="Prescribed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Medications</CardTitle>
            <CardDescription>Mark medications as taken</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMedications.map((med) => (
                <div
                  key={med.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    med.taken ? "bg-muted border-muted" : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={med.id}
                      checked={med.taken}
                      className="h-5 w-5"
                    />
                    <div>
                      <Label
                        htmlFor={med.id}
                        className={`text-sm font-medium ${med.taken ? "line-through text-muted-foreground" : ""}`}
                      >
                        {med.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} • {med.time}
                      </p>
                    </div>
                  </div>
                  {med.taken ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
