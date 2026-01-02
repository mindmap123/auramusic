import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// Cette route génère une signature pour upload direct vers Cloudinary
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = "music-streaming/mixes";
        
        // Create signature manually
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
        const signature = crypto
            .createHash("sha256")
            .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
            .digest("hex");

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder
        });
    } catch (error: any) {
        console.error("[Upload Signature] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
