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
        const stores = await prisma.store.findMany({
            include: {
                playSessions: {
                    include: { style: true }
                }
            }
        });

        const statsPerStore = stores.map(store => {
            const totalSeconds = store.playSessions.reduce((acc, sess) => acc + sess.totalPlayed, 0);
            const styleStats: Record<string, number> = {};

            store.playSessions.forEach(sess => {
                const name = sess.style.name;
                styleStats[name] = (styleStats[name] || 0) + sess.totalPlayed;
            });

            const favoriteStyle = Object.entries(styleStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "Aucun";

            return {
                name: store.name,
                totalHours: (totalSeconds / 3600).toFixed(1),
                favoriteStyle,
                sessionsCount: store.playSessions.length
            };
        });

        return NextResponse.json(statsPerStore);
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json([]);
    }
}
