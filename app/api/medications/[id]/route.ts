import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { taken } = body;

  // Verify ownership
  const existing = await prisma.medication.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Medication not found" }, { status: 404 });
  }

  const updated = await prisma.medication.update({
    where: { id: params.id },
    data: { taken },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.medication.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Medication not found" }, { status: 404 });
  }

  await prisma.medication.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}

