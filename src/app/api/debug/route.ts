import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        success: true,
        message: "API is working",
        timestamp: new Date().toISOString(),
        env: {
            CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
            NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
            POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
        }
    });
}