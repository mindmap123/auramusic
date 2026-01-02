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
        await prisma.store.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete store" }, { status: 500 });
    }
}
