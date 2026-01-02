import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "STORE") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { styleId } = await req.json();
        const storeId = (session.user as any).id;

        // 1. Update the store's current style
        const store = await prisma.store.update({
            where: { id: storeId },
            data: {
                currentStyleId: styleId,
            },
            include: {
                style: true,
            }
        });

        // 2. Find the progress for the NEW style
        const progress = await prisma.storeStyleProgress.findUnique({
            where: {
                storeId_styleId: {
                    storeId: storeId,
                    styleId: styleId,
                },
            },
        });

        // Return store data with the previous position for THIS style
        return NextResponse.json({
            ...store,
            currentPosition: progress?.lastPosition || 0
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to change style" }, { status: 500 });
    }
}
