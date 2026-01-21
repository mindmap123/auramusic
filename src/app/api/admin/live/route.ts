import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Dashboard data with live status, stats comparison, and popular styles
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch stores with current style
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

        // Calculate current stats
        const totalStores = stores.length;
        const activeStores = stores.filter(s => s.isActive).length;
        const playingNow = stores.filter(s => s.isPlaying).length;
        const autoModeCount = stores.filter(s => s.isAutoMode).length;

        // Get play sessions for today and yesterday for comparison
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        const [todaySessions, yesterdaySessions] = await Promise.all([
            prisma.playSession.findMany({
                where: { startedAt: { gte: todayStart } }
            }),
            prisma.playSession.findMany({
                where: {
                    startedAt: { gte: yesterdayStart, lt: todayStart }
                }
            })
        ]);

        const todayHours = Math.round(todaySessions.reduce((acc, s) => acc + s.totalPlayed, 0) / 3600 * 10) / 10;
        const yesterdayHours = Math.round(yesterdaySessions.reduce((acc, s) => acc + s.totalPlayed, 0) / 3600 * 10) / 10;
        const hoursDiff = Math.round((todayHours - yesterdayHours) * 10) / 10;

        // Count active stores yesterday (approximation based on sessions)
        const yesterdayActiveStores = new Set(yesterdaySessions.map(s => s.storeId)).size;
        const activeStoresDiff = activeStores - yesterdayActiveStores;

        // Get popular styles (most played this week)
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weekSessions = await prisma.playSession.findMany({
            where: { startedAt: { gte: weekAgo } },
            include: { style: true }
        });

        const stylePlaytime: Record<string, { style: any; seconds: number }> = {};
        weekSessions.forEach(session => {
            if (!stylePlaytime[session.styleId]) {
                stylePlaytime[session.styleId] = { style: session.style, seconds: 0 };
            }
            stylePlaytime[session.styleId].seconds += session.totalPlayed;
        });

        const popularStyles = Object.values(stylePlaytime)
            .sort((a, b) => b.seconds - a.seconds)
            .slice(0, 6)
            .map(s => ({
                id: s.style.id,
                name: s.style.name,
                coverUrl: s.style.coverUrl,
                icon: s.style.icon,
                hours: Math.round(s.seconds / 3600 * 10) / 10
            }));

        // Group stores by status
        const playing = stores.filter(s => s.isPlaying).slice(0, 5);
        const paused = stores.filter(s => s.isActive && !s.isPlaying);
        const inactive = stores.filter(s => !s.isActive);

        return NextResponse.json({
            stats: {
                activeStores,
                activeStoresDiff,
                playingNow,
                playingDiff: 0, // Real-time, no comparison
                todayHours,
                hoursDiff,
                autoModeCount,
            },
            stores: {
                playing,
                paused,
                inactive,
            },
            popularStyles,
            all: stores,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}
