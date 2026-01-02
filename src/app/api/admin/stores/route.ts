import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const stores = await prisma.store.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                style: {
                    select: { name: true }
                }
            }
        });
        return NextResponse.json(stores);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const store = await prisma.store.create({
            data: {
                name,
                email,
                password: hashedPassword,
                volume: 70
            },
        });

        const { password: _, ...storeWithoutPassword } = store;
        return NextResponse.json(storeWithoutPassword);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create store" }, { status: 500 });
    }
}
