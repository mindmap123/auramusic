import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET - Détails d'un membre
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                storeAccess: {
                    include: {
                        store: { select: { id: true, name: true, city: true } }
                    }
                },
                activityLogs: {
                    take: 20,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

// PATCH - Modifier un membre
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const { name, email, password, role, isActive, storeAccess } = data;

        // Préparer les données de mise à jour
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Mettre à jour l'utilisateur
        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                storeAccess: {
                    include: {
                        store: { select: { id: true, name: true } }
                    }
                }
            }
        });

        // Mettre à jour les accès aux stores si fournis
        if (storeAccess !== undefined) {
            // Supprimer les anciens accès
            await prisma.userStoreAccess.deleteMany({
                where: { userId: id }
            });

            // Créer les nouveaux accès
            if (storeAccess.length > 0) {
                await prisma.userStoreAccess.createMany({
                    data: storeAccess.map((access: any) => ({
                        userId: id,
                        storeId: access.storeId,
                        canEdit: access.canEdit || false,
                        canPlay: access.canPlay !== false,
                        canSchedule: access.canSchedule || false,
                    }))
                });
            }

            // Recharger avec les nouveaux accès
            const updatedUser = await prisma.user.findUnique({
                where: { id },
                include: {
                    storeAccess: {
                        include: {
                            store: { select: { id: true, name: true } }
                        }
                    }
                }
            });

            if (updatedUser) {
                const { password: _, ...userWithoutPassword } = updatedUser;
                return NextResponse.json(userWithoutPassword);
            }
        }

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

// DELETE - Supprimer un membre
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Empêcher la suppression d'un OWNER
        if (user.role === "OWNER") {
            return NextResponse.json({ error: "Cannot delete owner" }, { status: 403 });
        }

        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
