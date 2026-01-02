import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
        const body = await req.json();
        
        // Filter only allowed fields
        const data: any = {};
        if (body.name !== undefined) data.name = body.name;
        if (body.description !== undefined) data.description = body.description;
        if (body.icon !== undefined) data.icon = body.icon;
        if (body.colorTheme !== undefined) data.colorTheme = body.colorTheme;
        if (body.mixUrl !== undefined) data.mixUrl = body.mixUrl;
        
        const updatedStyle = await prisma.musicStyle.update({
            where: { id },
            data
        });
        
        return NextResponse.json(updatedStyle);
    } catch (error: any) {
        console.error("PATCH style error:", error);
        return NextResponse.json({ error: error.message || "Failed to update style" }, { status: 500 });
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
        await prisma.musicStyle.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE style error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete style" }, { status: 500 });
    }
}
