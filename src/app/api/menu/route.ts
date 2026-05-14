import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = {};
  if (categoryId) where.categoryId = categoryId;
  if (featured === "true") where.featured = true;

  const items = await prisma.menuItem.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const item = await prisma.menuItem.create({
    data: {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      image: body.image || null,
      categoryId: body.categoryId,
      available: body.available ?? true,
      featured: body.featured ?? false,
      spicy: body.spicy ?? false,
      vegetarian: body.vegetarian ?? false,
      calories: body.calories ? parseInt(body.calories) : null,
    },
    include: { category: true },
  });

  return NextResponse.json(item, { status: 201 });
}
