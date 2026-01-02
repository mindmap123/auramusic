import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cette route génère une signature pour upload direct vers Cloudinary
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { folder, resourceType } = await req.json();
        const timestamp = Math.round(new Date().getTime() / 1000);
        const uploadFolder = folder || "music-streaming/mixes";

        // Sign all parameters that will be sent to Cloudinary
        const paramsToSign = {
            timestamp,
            folder: uploadFolder,
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET!
        );

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder: uploadFolder
        });
    } catch (error: any) {
        console.error("[Upload Signature] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
