import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Récupérer toutes les sessions avec styles et stores
        const playSessions = await prisma.playSession.findMany({
            include: {
                style: true,
                store: true
            },
            orderBy: { startedAt: 'desc' }
        });

        const stores = await prisma.store.findMany();
        const styles = await prisma.musicStyle.findMany();

        // KPIs globaux
        const totalSeconds = playSessions.reduce((acc, sess) => acc + sess.totalPlayed, 0);
        const totalHours = totalSeconds / 3600;
        const totalSessions = playSessions.length;
        const activeStores = new Set(playSessions.map(s => s.storeId)).size;

        // Répartition par style (pour camembert)
        const styleStats: Record<string, { name: string; seconds: number; color: string }> = {};
        playSessions.forEach(sess => {
            const styleName = sess.style.name;
            if (!styleStats[styleName]) {
                styleStats[styleName] = {
                    name: styleName,
                    seconds: 0,
                    color: sess.style.colorTheme || '#8b5cf6'
                };
            }
            styleStats[styleName].seconds += sess.totalPlayed;
        });

        const styleDistribution = Object.values(styleStats)
            .map(s => ({
                name: s.name,
                value: Math.round(s.seconds / 3600 * 10) / 10,
                color: s.color
            }))
            .sort((a, b) => b.value - a.value);

        // Style le plus joué
        const topStyle = styleDistribution[0]?.name || "Aucun";

        // Heures d'écoute par jour (7 derniers jours)
        const now = new Date();
        const dailyStats: { date: string; hours: number }[] = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayStart = new Date(dateStr);
            const dayEnd = new Date(dateStr);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const daySeconds = playSessions
                .filter(sess => {
                    const sessDate = new Date(sess.startedAt);
                    return sessDate >= dayStart && sessDate < dayEnd;
                })
                .reduce((acc, sess) => acc + sess.totalPlayed, 0);

            dailyStats.push({
                date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                hours: Math.round(daySeconds / 3600 * 10) / 10
            });
        }

        // Stats par magasin (pour barres)
        const storeStats = stores.map(store => {
            const storeSessions = playSessions.filter(s => s.storeId === store.id);
            const storeSeconds = storeSessions.reduce((acc, sess) => acc + sess.totalPlayed, 0);

            const storeStyleStats: Record<string, number> = {};
            storeSessions.forEach(sess => {
                const name = sess.style.name;
                storeStyleStats[name] = (storeStyleStats[name] || 0) + sess.totalPlayed;
            });
            const favoriteStyle = Object.entries(storeStyleStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "Aucun";

            return {
                name: store.name,
                hours: Math.round(storeSeconds / 3600 * 10) / 10,
                sessions: storeSessions.length,
                favoriteStyle
            };
        }).sort((a, b) => b.hours - a.hours);

        // Top 5 magasins pour le graphique
        const topStores = storeStats.slice(0, 5);

        return NextResponse.json({
            kpis: {
                totalHours: Math.round(totalHours * 10) / 10,
                totalSessions,
                activeStores,
                totalStores: stores.length,
                topStyle
            },
            dailyStats,
            styleDistribution,
            storeStats,
            topStores
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({
            kpis: { totalHours: 0, totalSessions: 0, activeStores: 0, totalStores: 0, topStyle: "Aucun" },
            dailyStats: [],
            styleDistribution: [],
            storeStats: [],
            topStores: []
        });
    }
}
