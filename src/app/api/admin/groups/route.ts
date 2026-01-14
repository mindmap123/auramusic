import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all groups with store count
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const groups = await prisma.storeGroup.findMany({
            include: {
                _count: {
                    select: { stores: true }
                },
                stores: {
                    select: {
                        id: true,
                        name: true,
                        isActive: true,
                        isPlaying: true,
                        city: true,
                    }
                }
            },
            orderBy: { name: "asc" }
        });

        return NextResponse.json(groups);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
    }
}

// POST create new group
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, description, color, defaultStyleId, defaultVolume } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const group = await prisma.storeGroup.create({
            data: {
                name,
                description,
                color: color || "#1db954",
                defaultStyleId,
                defaultVolume: defaultVolume || 70,
            }
        });

        return NextResponse.json(group);
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Group name already exists" }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }
}
