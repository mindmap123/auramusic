import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        console.log("[API Test] Starting diagnostics");
        
        // Test session
        const session = await getServerSession(authOptions);
        console.log("[API Test] Session:", !!session, session?.user ? (session.user as any).role : 'no user');
        
        // Test database
        const stylesCount = await prisma.musicStyle.count();
        console.log("[API Test] Database styles count:", stylesCount);
        
        // Test environment variables
        const envCheck = {
            CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
            POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
            NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        };
        console.log("[API Test] Environment variables:", envCheck);
        
        return NextResponse.json({
            success: true,
            session: !!session,
            userRole: session?.user ? (session.user as any).role : null,
            stylesCount,
            envCheck
        });
    } catch (error: any) {
        console.error("[API Test] Error:", error);
        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}