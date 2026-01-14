import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Live status of all stores (who's playing what)
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const stores = await prisma.store.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                isPlaying: true,
                isAutoMode: true,
                volume: true,
                city: true,
                storeType: true,
                lastPlayedAt: true,
                group: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    }
                },
                style: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        coverUrl: true,
                    }
                }
            },
            orderBy: [
                { isPlaying: "desc" },
                { lastPlayedAt: "desc" },
                { name: "asc" }
            ]
        });

        // Calculate stats
        const totalStores = stores.length;
        const activeStores = stores.filter(s => s.isActive).length;
        const playingNow = stores.filter(s => s.isPlaying).length;
        const autoModeCount = stores.filter(s => s.isAutoMode).length;

        // Group by status
        const playing = stores.filter(s => s.isPlaying);
        const paused = stores.filter(s => s.isActive && !s.isPlaying);
        const inactive = stores.filter(s => !s.isActive);

        return NextResponse.json({
            stats: {
                totalStores,
                activeStores,
                playingNow,
                autoModeCount,
            },
            stores: {
                playing,
                paused,
                inactive,
            },
            all: stores,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch live status" }, { status: 500 });
    }
}
