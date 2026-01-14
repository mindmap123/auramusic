import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // await params for Next.js 15+
        const { bannerHorizontal, bannerVertical } = await request.json();
        
        // Convert to Float and validate input
        const posX = parseFloat(bannerHorizontal);
        const posY = parseFloat(bannerVertical);
        
        if (
            isNaN(posX) || isNaN(posY) ||
            posX < 0 || posX > 100 ||
            posY < 0 || posY > 100
        ) {
            return NextResponse.json(
                { error: "Invalid position values. Must be numbers between 0-100." },
                { status: 400 }
            );
        }

        const style = await prisma.musicStyle.update({
            where: { id },
            data: {
                bannerPositionX: posX,
                bannerPositionY: posY
            }
        });

        return NextResponse.json({ 
            success: true, 
            bannerPositionX: style.bannerPositionX,
            bannerPositionY: style.bannerPositionY
        });
    } catch (error) {
        console.error("Banner position update error:", error);
        return NextResponse.json(
            { error: "Failed to update banner position" },
            { status: 500 }
        );
    }
}