import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const styles = await prisma.musicStyle.findMany();
        return NextResponse.json(styles);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch styles" }, { status: 500 });
    }
}
