import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        console.warn("[CoverUpload] Unauthorized attempt:", session?.user?.email, "Role:", (session?.user as any)?.role);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log('[CoverUpload] Starting upload...');
        
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const styleId = formData.get("styleId") as string | null;

        if (!file) {
            console.error('[CoverUpload] No file provided');
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }

        console.log('[CoverUpload] File details:', {
            name: file.name,
            type: file.type,
            size: file.size,
            styleId
        });

        const buffer = Buffer.from(await file.arrayBuffer());
        console.log('[CoverUpload] Buffer created, size:', buffer.length);

        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "image",
                    folder: "music-streaming/covers",
                    transformation: [
                        { width: 500, height: 500, crop: "fill" },
                        { quality: "auto" }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error('[CoverUpload] Cloudinary error:', error);
                        reject(error);
                    } else {
                        console.log('[CoverUpload] Cloudinary success:', result?.secure_url);
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        const result = (await uploadPromise) as any;

        if (styleId) {
            console.log('[CoverUpload] Updating style:', styleId);
            await prisma.musicStyle.update({
                where: { id: styleId },
                data: { coverUrl: result.secure_url },
            });
        }

        console.log('[CoverUpload] Upload complete:', result.secure_url);
        return NextResponse.json({ success: true, url: result.secure_url });
    } catch (error: any) {
        console.error("[CoverUpload] Error:", error);
        return NextResponse.json({ 
            error: error.message || "Upload failed",
            details: error.http_code ? `Cloudinary error ${error.http_code}` : undefined
        }, { status: 500 });
    }
}
