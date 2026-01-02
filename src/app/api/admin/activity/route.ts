import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Récupérer les logs d'activité (admin)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const storeId = searchParams.get("storeId");
        const date = searchParams.get("date"); // Format: YYYY-MM-DD
        const limit = parseInt(searchParams.get("limit") || "100");

        const where: any = {};
        
        if (storeId) {
            where.storeId = storeId;
        }

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            where.createdAt = {
                gte: startOfDay,
                lte: endOfDay
            };
        }

        const logs = await prisma.activityLog.findMany({
            where,
            include: {
                store: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: limit
        });

        // Parse details JSON
        const parsedLogs = logs.map(log => ({
            ...log,
            details: log.details ? JSON.parse(log.details) : null
        }));

        return NextResponse.json(parsedLogs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
