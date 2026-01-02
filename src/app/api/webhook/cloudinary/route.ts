import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Cloudinary notifications usually follow a specific format.
        // For PowerFlows or Upload notifications:
        const { notification_type, secure_url, context, duration } = body;

        // We look for our context.custom.styleId (Cloudinary structure for context)
        // Note: Cloudinary sends context in the 'context' field, often nested
        const styleId = context?.custom?.styleId;

        if (!styleId) {
            console.log("Cloudinary Webhook: No styleId found in context. Skipping.");
            return NextResponse.json({ message: "No styleId provided" }, { status: 200 });
        }

        if (notification_type === "upload" || notification_type === "transformation") {
            await prisma.musicStyle.update({
                where: { id: styleId },
                data: {
                    mixUrl: secure_url,
                    duration: duration ? Math.floor(duration) : 3600
                }
            });
            console.log(`Cloudinary Webhook: Updated style ${styleId} with URL ${secure_url}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Cloudinary Webhook Error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
