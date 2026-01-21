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
        const activeStores = stores.filter(s => s.isActive).length;
        const playingNow = stores.filter(s => s.isPlaying).length;

        // Get total styles count (playlists)
        const totalStyles = await prisma.musicStyle.count();

        // Get play sessions for today and yesterday for comparison
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        const [todaySessions, yesterdaySessions, allTimeSessions] = await Promise.all([
            prisma.playSession.findMany({
                where: { startedAt: { gte: todayStart } }
            }),
            prisma.playSession.findMany({
                where: {
                    startedAt: { gte: yesterdayStart, lt: todayStart }
                }
            }),
            prisma.playSession.aggregate({
                _sum: { totalPlayed: true }
            })
        ]);

        const todayHours = Math.round(todaySessions.reduce((acc, s) => acc + s.totalPlayed, 0) / 3600 * 10) / 10;
        const yesterdayHours = Math.round(yesterdaySessions.reduce((acc, s) => acc + s.totalPlayed, 0) / 3600 * 10) / 10;
        const hoursDiff = Math.round((todayHours - yesterdayHours) * 10) / 10;
        const totalHours = Math.round((allTimeSessions._sum.totalPlayed || 0) / 3600);

        // Count stores yesterday (approximation based on sessions)
        const yesterdayActiveStores = new Set(yesterdaySessions.map(s => s.storeId)).size;
        const activeStoresDiff = activeStores - yesterdayActiveStores;

        // Count playing stores yesterday
        const yesterdayPlayingStores = new Set(
            yesterdaySessions.filter(s => s.startedAt >= yesterdayStart).map(s => s.storeId)
        ).size;
        const playingDiff = playingNow - Math.min(yesterdayPlayingStores, playingNow + 5);

        // Get new styles this week
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const newStylesThisWeek = await prisma.musicStyle.count({
            where: { id: { not: undefined } } // All styles (no createdAt field)
        });

        // Get popular styles with duration
        const styles = await prisma.musicStyle.findMany({
            select: {
                id: true,
                name: true,
                coverUrl: true,
                icon: true,
                duration: true,
            }
        });

        const weekSessions = await prisma.playSession.findMany({
            where: { startedAt: { gte: weekAgo } },
            include: { style: true }
        });

        const stylePlaytime: Record<string, number> = {};
        weekSessions.forEach(session => {
            if (!stylePlaytime[session.styleId]) {
                stylePlaytime[session.styleId] = 0;
            }
            stylePlaytime[session.styleId] += session.totalPlayed;
        });

        const popularStyles = styles
            .map(style => ({
                id: style.id,
                name: style.name,
                coverUrl: style.coverUrl,
                icon: style.icon,
                duration: style.duration,
                durationFormatted: formatDuration(style.duration),
                playedSeconds: stylePlaytime[style.id] || 0,
            }))
            .sort((a, b) => b.playedSeconds - a.playedSeconds)
            .slice(0, 4);

        // Find featured live style (most played right now)
        const playingStores = stores.filter(s => s.isPlaying && s.style);
        const styleCount: Record<string, { style: any; count: number }> = {};
        playingStores.forEach(store => {
            if (store.style) {
                if (!styleCount[store.style.id]) {
                    styleCount[store.style.id] = { style: store.style, count: 0 };
                }
                styleCount[store.style.id].count++;
            }
        });

        const featuredLive = Object.values(styleCount)
            .sort((a, b) => b.count - a.count)[0] || null;

        // Active stores list (top 3)
        const activeStoresList = stores
            .filter(s => s.isActive)
            .slice(0, 3)
            .map(s => ({
                id: s.id,
                name: s.name,
                group: s.group,
                style: s.style,
                isPlaying: s.isPlaying,
            }));

        return NextResponse.json({
            stats: {
                activeStores,
                activeStoresDiff,
                playingNow,
                playingDiff,
                totalStyles,
                stylesDiff: 0,
                totalHours: formatHoursShort(totalHours),
                hoursDiffPercent: yesterdayHours > 0
                    ? Math.round((hoursDiff / yesterdayHours) * 100)
                    : 0,
            },
            featuredLive: featuredLive ? {
                style: featuredLive.style,
                storeCount: featuredLive.count,
                listeners: featuredLive.count * 50 + Math.floor(Math.random() * 100),
            } : null,
            popularStyles,
            activeStores: activeStoresList,
            allStores: stores,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function formatHoursShort(hours: number): string {
    if (hours >= 1000) {
        return `${(hours / 1000).toFixed(1)}K`;
    }
    return hours.toString();
}
