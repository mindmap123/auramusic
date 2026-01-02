import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const schedules = await prisma.storeSchedule.findMany({
            include: { style: true, store: true }
        });
        return NextResponse.json(schedules);
    } catch (error: any) {
        console.error("[API Schedules] GET full error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { styleId, startTime, endTime, storeId } = body;

        const newSchedule = await prisma.storeSchedule.create({
            data: {
                styleId,
                startTime,
                endTime,
                storeId: storeId || null
            }
        });

        return NextResponse.json(newSchedule);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create schedule" }, { status: 500 });
    }
}
