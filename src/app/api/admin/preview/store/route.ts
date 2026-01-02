import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let storeId = searchParams.get("storeId");

    // If no storeId, get the first one available
    if (!storeId) {
        const firstStore = await prisma.store.findFirst();
        if (!firstStore) {
            return NextResponse.json({ error: "No stores found" }, { status: 404 });
        }
        storeId = firstStore.id;
    }

    try {
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: { style: true }
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        // Fetch progress for the current style
        let currentPosition = 0;
        if (store.currentStyleId) {
            const progress = await prisma.storeStyleProgress.findUnique({
                where: {
                    storeId_styleId: {
                        storeId: storeId,
                        styleId: store.currentStyleId,
                    },
                },
            });
            currentPosition = progress?.lastPosition || 0;
        }

        return NextResponse.json({ ...store, currentPosition });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch store data" }, { status: 500 });
    }
}
