import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const styleId = formData.get("styleId") as string;

        console.log(`[API Mixes] Starting upload for ${file.name} (${file.size} bytes) for style ${styleId}`);

        if (!file || !styleId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "video",
                    folder: "music-streaming/mixes",
                    context: { styleId: styleId }
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        const result = (await uploadPromise) as any;

        await prisma.musicStyle.update({
            where: { id: styleId },
            data: { mixUrl: result.secure_url },
        });

        return NextResponse.json({ success: true, url: result.secure_url });
    } catch (error: any) {
        console.error("[API Mixes] Upload error details:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
