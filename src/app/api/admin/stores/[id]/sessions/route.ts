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
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const format = searchParams.get('format'); // 'json' or 'csv'
        
        // Construire le filtre de date
        const dateFilter: any = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
            dateFilter.lte = new Date(endDate);
        }
        
        // Récupérer toutes les sessions
        const sessions = await prisma.playSession.findMany({
            where: {
                storeId: id,
                ...(Object.keys(dateFilter).length > 0 && {
                    startedAt: dateFilter
                })
            },
            include: {
                style: {
                    select: { name: true }
                }
            },
            orderBy: { startedAt: 'desc' }
        });
        
        // Calculer la durée pour chaque session
        const now = new Date();
        const sessionsWithDuration = sessions.map(session => {
            let duration: number;
            
            if (session.endedAt) {
                // Session terminée : utiliser totalPlayed ou calculer
                duration = session.totalPlayed || 
                    Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000);
            } else {
                // Session active : calculer depuis startedAt jusqu'à maintenant
                duration = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);
            }
            
            return {
                id: session.id,
                styleName: session.style.name,
                startedAt: session.startedAt,
                endedAt: session.endedAt,
                duration,
                isActive: !session.endedAt
            };
        });
        
        // Format CSV si demandé
        if (format === 'csv') {
            const csv = [
                'ID,Style,Started At,Ended At,Duration (seconds),Status',
                ...sessionsWithDuration.map(s => 
                    `${s.id},${s.styleName},${s.startedAt.toISOString()},${s.endedAt?.toISOString() || 'Active'},${s.duration},${s.isActive ? 'Active' : 'Completed'}`
                )
            ].join('\n');
            
            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="sessions-${id}.csv"`
                }
            });
        }
        
        return NextResponse.json(sessionsWithDuration);
    } catch (error) {
        console.error("Get sessions error:", error);
        return NextResponse.json({ 
            error: "Failed to fetch sessions" 
        }, { status: 500 });
    }
}
