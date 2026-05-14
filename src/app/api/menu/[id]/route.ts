import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const item = await prisma.menuItem.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: parseFloat(body.price) }),
      ...(body.image !== undefined && { image: body.image || null }),
      ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
      ...(body.available !== undefined && { available: body.available }),
      ...(body.featured !== undefined && { featured: body.featured }),
      ...(body.spicy !== undefined && { spicy: body.spicy }),
      ...(body.vegetarian !== undefined && { vegetarian: body.vegetarian }),
      ...(body.calories !== undefined && { calories: body.calories ? parseInt(body.calories) : null }),
    },
    include: { category: true },
  });

  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.menuItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
