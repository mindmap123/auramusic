import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Récupérer les favoris du store
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "STORE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const favorites = await prisma.storeFavorite.findMany({
            where: { storeId: (session.user as any).id },
            include: { style: true },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(favorites.map(f => f.style));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Ajouter/Retirer un favori (toggle)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "STORE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { styleId } = await req.json();
        const storeId = (session.user as any).id;

        // Check if already favorite
        const existing = await prisma.storeFavorite.findUnique({
            where: { storeId_styleId: { storeId, styleId } }
        });

        if (existing) {
            // Remove from favorites
            await prisma.storeFavorite.delete({
                where: { id: existing.id }
            });
            return NextResponse.json({ isFavorite: false });
        } else {
            // Add to favorites
            await prisma.storeFavorite.create({
                data: { storeId, styleId }
            });
            return NextResponse.json({ isFavorite: true });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
