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
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const styleId = formData.get("styleId") as string;

        if (!file || !styleId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

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
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        const result = (await uploadPromise) as any;

        await prisma.musicStyle.update({
            where: { id: styleId },
            data: { coverUrl: result.secure_url },
        });

        return NextResponse.json({ success: true, url: result.secure_url });
    } catch (error: any) {
        console.error("Cover upload error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
