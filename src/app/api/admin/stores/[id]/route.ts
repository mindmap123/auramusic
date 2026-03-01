import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, email, password, isActive } = await req.json();
        const { id } = await params;

        const data: any = {
            ...(name && { name }),
            ...(email && { email }),
            ...(isActive !== undefined && { isActive }),
        };

        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        const store = await prisma.store.update({
            where: { id },
            data,
        });

        const { password: _, ...storeWithoutPassword } = store;
        return NextResponse.json(storeWithoutPassword);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        
        // Vérifier que le store existe
        const store = await prisma.store.findUnique({
            where: { id },
            select: { id: true, name: true }
        });
        
        if (!store) {
            return NextResponse.json(
                { error: "Store not found" }, 
                { status: 404 }
            );
        }
        
        // Supprimer le store (cascade delete automatique)
        await prisma.store.delete({ where: { id } });
        
        // Logger l'action
        console.log(`Store deleted: ${store.name} (${id})`);
        
        return NextResponse.json({ 
            success: true,
            message: `Store "${store.name}" deleted successfully`
        });
    } catch (error: any) {
        console.error("Delete store error:", error);
        
        // Identifier les erreurs de contrainte
        if (error.code === 'P2003') {
            return NextResponse.json({ 
                error: "Cannot delete store due to foreign key constraint",
                details: error.meta?.field_name
            }, { status: 400 });
        }
        
        return NextResponse.json({ 
            error: "Failed to delete store",
            details: error.message
        }, { status: 500 });
    }
}
