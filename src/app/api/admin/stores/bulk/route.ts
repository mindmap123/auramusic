import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Bulk update stores (assign style, group, etc.)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { storeIds, action, value } = await req.json();

        if (!storeIds || !Array.isArray(storeIds) || storeIds.length === 0) {
            return NextResponse.json({ error: "No stores selected" }, { status: 400 });
        }

        if (!action) {
            return NextResponse.json({ error: "Action is required" }, { status: 400 });
        }

        let updateData: any = {};

        switch (action) {
            case "assignStyle":
                updateData = { currentStyleId: value };
                break;
            case "assignGroup":
                updateData = { groupId: value || null };
                break;
            case "setVolume":
                updateData = { volume: parseInt(value) };
                break;
            case "activate":
                updateData = { isActive: true };
                break;
            case "deactivate":
                updateData = { isActive: false };
                break;
            case "enableAutoMode":
                updateData = { isAutoMode: true };
                break;
            case "disableAutoMode":
                updateData = { isAutoMode: false };
                break;
            case "setCity":
                updateData = { city: value };
                break;
            case "setStoreType":
                updateData = { storeType: value };
                break;
            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const result = await prisma.store.updateMany({
            where: {
                id: { in: storeIds }
            },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            updatedCount: result.count,
            action,
            value
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update stores" }, { status: 500 });
    }
}
