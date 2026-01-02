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
        const [stores, stylesCount, stylesWithMix, sessions] = await Promise.all([
            prisma.store.count(),
            prisma.musicStyle.count(),
            prisma.musicStyle.count({ where: { NOT: { mixUrl: null } } }),
            prisma.playSession.count(),
        ]);

        return NextResponse.json({ stores, stylesCount, stylesWithMix, sessions });
    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ stores: 0, stylesCount: 0, stylesWithMix: 0, sessions: 0 });
    }
}
