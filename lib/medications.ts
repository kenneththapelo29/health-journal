import { prisma } from "@/lib/prisma";

// Types for our medication data
export type Medication = {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  time: Date;
  taken: boolean;
  timestamp: Date;
  notes?: string | null;
};

// Get all medications for a user
export async function getMedications(userId: string): Promise<Medication[]> {
  return await prisma.medication.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      time: 'asc',
    },
  });
}

// Create a new medication
export async function createMedication(data: Omit<Medication, 'id' | 'timestamp'>): Promise<Medication> {
  return await prisma.medication.create({
    data: {
      ...data,
      timestamp: new Date(),
    },
  });
}

// Update a medication (e.g., mark as taken)
export async function updateMedication(id: string, data: Partial<Medication>): Promise<Medication> {
  return await prisma.medication.update({
    where: { id },
    data,
  });
}

// Delete a medication
export async function deleteMedication(id: string): Promise<void> {
  await prisma.medication.delete({
    where: { id },
  });
}