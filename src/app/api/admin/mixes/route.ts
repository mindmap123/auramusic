import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

// Configuration pour les gros fichiers
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        console.log("[API Mixes] 🔵 Requête reçue");
        
        const session = await getServerSession(authOptions);
        console.log("[API Mixes] Session check:", !!session, session?.user ? (session.user as any).role : 'no user');

        if (!session || (session.user as any).role !== "ADMIN") {
            console.log("[API Mixes] ❌ Unauthorized access attempt");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("[API Mixes] 🔵 Parsing form data");
        let formData;
        try {
            formData = await req.formData();
        } catch (e) {
            console.error("[API Mixes] ❌ FormData parse error:", e);
            return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
        }

        const file = formData.get("file") as File;
        const styleId = formData.get("styleId") as string;

        console.log(`[API Mixes] 🔵 Received file: ${file?.name} (${file?.size} bytes), styleId: ${styleId}`);

        if (!file || !styleId) {
            console.log("[API Mixes] ❌ Missing required fields");
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Vérifier la taille du fichier (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            console.log("[API Mixes] ❌ File too large:", file.size);
            return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 413 });
        }

        console.log("[API Mixes] 🔵 Converting file to buffer");
        const buffer = Buffer.from(await file.arrayBuffer());

        console.log("[API Mixes] 🔵 Starting Cloudinary upload");
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "video",
                    folder: "music-streaming/mixes",
                    context: { styleId: styleId }
                },
                (error, result) => {
                    if (error) {
                        console.error("[API Mixes] ❌ Cloudinary error:", error);
                        reject(error);
                    } else {
                        console.log("[API Mixes] 🟢 Cloudinary success:", result?.secure_url);
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        const result = (await uploadPromise) as any;

        console.log("[API Mixes] 🔵 Updating database");
        await prisma.musicStyle.update({
            where: { id: styleId },
            data: { mixUrl: result.secure_url },
        });

        console.log("[API Mixes] 🟢 Upload completed successfully");
        return NextResponse.json({ success: true, url: result.secure_url });
        
    } catch (error: any) {
        console.error("[API Mixes] ❌ Upload error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // TOUJOURS retourner du JSON
        return NextResponse.json({ 
            error: error.message || "Upload failed",
            type: error.name || "UnknownError",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
