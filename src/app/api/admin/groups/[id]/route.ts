import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH update group
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { name, description, color, defaultStyleId, defaultVolume } = await req.json();

        const group = await prisma.storeGroup.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(color !== undefined && { color }),
                ...(defaultStyleId !== undefined && { defaultStyleId }),
                ...(defaultVolume !== undefined && { defaultVolume }),
            }
        });

        return NextResponse.json(group);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
    }
}

// DELETE group
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

        // First, unlink all stores from this group
        await prisma.store.updateMany({
            where: { groupId: id },
            data: { groupId: null }
        });

        // Then delete the group
        await prisma.storeGroup.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
    }
}
