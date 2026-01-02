import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "STORE") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = (session.user as any).id;
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    // 1. Check for store-specific schedule
    let schedule = await prisma.storeSchedule.findFirst({
        where: {
            storeId,
            startTime: { lte: currentTimeStr },
            endTime: { gte: currentTimeStr }
        },
        include: { style: true }
    });

    // 2. If no store schedule, check for global schedule
    if (!schedule) {
        schedule = await prisma.storeSchedule.findFirst({
            where: {
                storeId: null,
                startTime: { lte: currentTimeStr },
                endTime: { gte: currentTimeStr }
            },
            include: { style: true }
        });
    }

    if (!schedule) {
        return NextResponse.json({ style: null });
    }

    return NextResponse.json({ style: schedule.style });
}
