import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const styles = await prisma.musicStyle.findMany();
    return NextResponse.json(styles);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, slug, description, icon, colorTheme } = body;

        const newStyle = await prisma.musicStyle.create({
            data: {
                name,
                slug,
                description,
                icon,
                colorTheme,
                mixUrl: null,
                duration: 3600
            }
        });

        return NextResponse.json(newStyle);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create style" }, { status: 500 });
    }
}
