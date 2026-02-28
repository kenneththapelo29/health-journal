"use client";

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export async function login(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }

  return res.json();
}

export async function register(email: string, password: string) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Registration failed");
  }

  return res.json();
}

export async function logout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Logout failed");
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export interface HealthEntry {
  id: string;
  userId: string;
  date: string;
  weight: number | null;
  sleep: number | null;
  calories: number | null;
  steps: number | null;
  mood: number | null;
  notes: string | null;
  createdAt: string;
}

export async function getHealthEntries(): Promise<HealthEntry[]> {
  const res = await fetch("/api/health-entries");
  if (!res.ok) throw new Error("Failed to fetch entries");
  const data = await res.json();
  return data.entries;
}

export async function createHealthEntry(data: {
  date: string;
  weight?: number;
  sleep?: number;
  calories?: number;
  steps?: number;
  mood?: number;
  notes?: string;
}): Promise<HealthEntry> {
  const res = await fetch("/api/health-entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create entry");
  }

  const result = await res.json();
  return result.entry;
}
