import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateStoreSessionMiddleware } from "@/lib/sessionMiddleware";

export async function PATCH(req: NextRequest) {
    // Vérifier la session
    const validation = await validateStoreSessionMiddleware();
    if (!validation.valid) {
        return validation.response;
    }

    try {
        const { currentStyleId, volume, isPlaying, isAutoMode, accentColor } = await req.json();
        const storeId = validation.user.id;

        const updatedStore = await prisma.store.update({
            where: { id: storeId },
            data: {
                ...(currentStyleId !== undefined && { currentStyleId }),
                ...(volume !== undefined && { volume }),
                ...(isPlaying !== undefined && { isPlaying }),
                ...(isAutoMode !== undefined && { isAutoMode }),
                ...(accentColor !== undefined && { accentColor }),
            },
        });

        return NextResponse.json(updatedStore);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update store settings" }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "STORE") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const store = await prisma.store.findUnique({
            where: { id: (session.user as any).id },
            include: { style: true }
        });
        return NextResponse.json(store);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch store data" }, { status: 500 });
    }
}
