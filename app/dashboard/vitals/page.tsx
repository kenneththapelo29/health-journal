"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const mockVitalsData = [
  { date: "2024-01-20", systolic: 118, diastolic: 78, heartRate: 72, temperature: 98.6 },
  { date: "2024-01-21", systolic: 120, diastolic: 80, heartRate: 75, temperature: 98.8 },
  { date: "2024-01-22", systolic: 122, diastolic: 82, heartRate: 70, temperature: 98.4 },
  { date: "2024-01-23", systolic: 119, diastolic: 79, heartRate: 73, temperature: 98.7 },
  { date: "2024-01-24", systolic: 121, diastolic: 81, heartRate: 71, temperature: 98.5 },
];

const mockVitalsEntries = [
  { id: "1", timestamp: new Date("2024-01-24T08:00:00"), systolic: 121, diastolic: 81, heartRate: 71, temperature: 98.5, notes: "Morning reading" },
  { id: "2", timestamp: new Date("2024-01-24T14:30:00"), systolic: 118, diastolic: 76, heartRate: 68, temperature: 98.7, notes: "Afternoon check" },
  { id: "3", timestamp: new Date("2024-01-23T08:15:00"), systolic: 119, diastolic: 79, heartRate: 73, temperature: 98.7, notes: "" },
  { id: "4", timestamp: new Date("2024-01-23T20:00:00"), systolic: 117, diastolic: 75, heartRate: 65, temperature: 98.4, notes: "Before bed" },
];

export default function VitalsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    heartRate: "",
    temperature: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log("Submitting:", formData);
    setIsDialogOpen(false);
    setFormData({ systolic: "", diastolic: "", heartRate: "", temperature: "", notes: "" });
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vitals</h1>
            <p className="text-muted-foreground">Track your blood pressure, heart rate, and temperature</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Reading
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Vital Signs</DialogTitle>
                <DialogDescription>
                  Record your vital signs. All fields are optional.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systolic">Systolic BP (mmHg)</Label>
                    <Input
                      id="systolic"
                      type="number"
                      placeholder="120"
                      value={formData.systolic}
                      onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolic">Diastolic BP (mmHg)</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      placeholder="80"
                      value={formData.diastolic}
                      onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      placeholder="72"
                      value={formData.heartRate}
                      onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°F)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Any additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">121/81</div>
              <p className="text-xs text-muted-foreground">
                mmHg
              </p>
              <div className="mt-2 flex items-center text-xs">
                {getTrendIcon(121, 119)}
                <span className="ml-1">+2 from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">71</div>
              <p className="text-xs text-muted-foreground">
                bpm
              </p>
              <div className="mt-2 flex items-center text-xs">
                {getTrendIcon(71, 73)}
                <span className="ml-1">-2 from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5°F</div>
              <p className="text-xs text-muted-foreground">
                Normal range
              </p>
              <div className="mt-2 flex items-center text-xs">
                {getTrendIcon(98.5, 98.7)}
                <span className="ml-1">-0.2 from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SpO2</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">
                Oxygen saturation
              </p>
              <div className="mt-2 flex items-center text-xs">
                <Minus className="h-4 w-4 text-gray-500" />
                <span className="ml-1">Same as yesterday</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vitals Trends</CardTitle>
            <CardDescription>Your vitals over the past 5 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockVitalsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="systolic" stroke="#8b5cf6" name="Systolic BP" />
                  <Line type="monotone" dataKey="diastolic" stroke="#14b8a6" name="Diastolic BP" />
                  <Line type="monotone" dataKey="heartRate" stroke="#f97066" name="Heart Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Your recent vital sign recordings</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>BP (mmHg)</TableHead>
                  <TableHead>HR (bpm)</TableHead>
                  <TableHead>Temp (°F)</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockVitalsEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{format(entry.timestamp, "MMM d, h:mm a")}</TableCell>
                    <TableCell>{entry.systolic}/{entry.diastolic}</TableCell>
                    <TableCell>{entry.heartRate}</TableCell>
                    <TableCell>{entry.temperature}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{entry.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
