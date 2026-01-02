import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Logger une activité (play, pause, change style)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "STORE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { action, details } = await req.json();
        const storeId = (session.user as any).id;

        // Valider l'action
        const validActions = ["PLAY", "PAUSE", "CHANGE_STYLE"];
        if (!validActions.includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        await prisma.activityLog.create({
            data: {
                storeId,
                action,
                details: details ? JSON.stringify(details) : null
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
