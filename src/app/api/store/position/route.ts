import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "STORE") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const styleId = searchParams.get("styleId");
    const storeId = (session.user as any).id;

    if (!styleId) {
        return NextResponse.json({ position: 0 });
    }

    try {
        const progress = await prisma.storeStyleProgress.findUnique({
            where: {
                storeId_styleId: {
                    storeId,
                    styleId,
                },
            },
        });
        return NextResponse.json({ position: progress?.lastPosition || 0 });
    } catch (error) {
        return NextResponse.json({ position: 0 });
    }
}
