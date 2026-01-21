import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET - Liste tous les membres de l'équipe
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                storeAccess: {
                    include: {
                        store: {
                            select: { id: true, name: true, city: true }
                        }
                    }
                }
            }
        });

        // Exclure les mots de passe
        const usersWithoutPassword = users.map(({ password, ...user }) => user);
        return NextResponse.json(usersWithoutPassword);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }
}

// POST - Créer un nouveau membre
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, email, password, role, storeAccess } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Nom, email et mot de passe requis" }, { status: 400 });
        }

        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "VIEWER",
                invitedBy: (session.user as any).id,
                invitedAt: new Date(),
                storeAccess: storeAccess && storeAccess.length > 0 ? {
                    create: storeAccess.map((access: any) => ({
                        storeId: access.storeId,
                        canEdit: access.canEdit || false,
                        canPlay: access.canPlay !== false,
                        canSchedule: access.canSchedule || false,
                    }))
                } : undefined
            },
            include: {
                storeAccess: {
                    include: {
                        store: { select: { id: true, name: true } }
                    }
                }
            }
        });

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
    }
}
