import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "STORE") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { position, isPlaying } = await req.json();
        const storeId = (session.user as any).id;

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { currentStyleId: true }
        });

        if (!store || !store.currentStyleId) {
            return NextResponse.json({ error: "No active style" }, { status: 400 });
        }

        // Update global store state
        await prisma.store.update({
            where: { id: storeId },
            data: {
                ...(isPlaying !== undefined && { isPlaying }),
                lastPlayedAt: new Date(),
            },
        });

        // Save position for THIS specific style
        await prisma.storeStyleProgress.upsert({
            where: {
                storeId_styleId: {
                    storeId: storeId,
                    styleId: store.currentStyleId,
                },
            },
            update: { lastPosition: position },
            create: {
                storeId: storeId,
                styleId: store.currentStyleId,
                lastPosition: position,
            },
        });

        // --- ANALYTICS: Update/Create Play Session ---
        // We increment by 10s because the heartbeat is every 10s
        if (isPlaying) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // We use a simplified logic: one session per store/style per day
            const existingSession = await prisma.playSession.findFirst({
                where: {
                    storeId,
                    styleId: store.currentStyleId,
                    startedAt: { gte: today }
                },
                orderBy: { startedAt: 'desc' }
            });

            if (existingSession) {
                await prisma.playSession.update({
                    where: { id: existingSession.id },
                    data: {
                        totalPlayed: { increment: 10 },
                        endedAt: new Date()
                    }
                });
            } else {
                await prisma.playSession.create({
                    data: {
                        storeId,
                        styleId: store.currentStyleId,
                        totalPlayed: 10,
                        startedAt: new Date(),
                        endedAt: new Date()
                    }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to save position" }, { status: 500 });
    }
}
