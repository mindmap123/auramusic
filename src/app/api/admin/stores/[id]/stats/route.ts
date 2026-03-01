import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        
        // Récupérer toutes les sessions
        const sessions = await prisma.playSession.findMany({
            where: { storeId: id },
            select: {
                startedAt: true,
                endedAt: true,
                totalPlayed: true
            }
        });
        
        const now = new Date();
        let totalListeningSeconds = 0;
        let activeSessions = 0;
        
        // Calculer le total et compter les sessions actives
        sessions.forEach(session => {
            if (session.endedAt) {
                // Session terminée
                totalListeningSeconds += session.totalPlayed || 
                    Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000);
            } else {
                // Session active
                activeSessions++;
                totalListeningSeconds += 
                    Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);
            }
        });
        
        // Convertir en heures
        const totalListeningHours = totalListeningSeconds / 3600;
        
        return NextResponse.json({
            totalSessions: sessions.length,
            activeSessions,
            totalListeningHours: Math.round(totalListeningHours * 100) / 100,
            hasConcurrentSessions: activeSessions > 1
        });
    } catch (error) {
        console.error("Get stats error:", error);
        return NextResponse.json({ 
            error: "Failed to fetch statistics" 
        }, { status: 500 });
    }
}
