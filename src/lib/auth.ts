import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Check Store first
                const store = await prisma.store.findUnique({
                    where: { email: credentials.email },
                });

                if (store && await bcrypt.compare(credentials.password, store.password)) {
                    return {
                        id: store.id,
                        email: store.email,
                        name: store.name,
                        role: "STORE",
                        userRole: null,
                    };
                }

                // Check Team User (new system)
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: {
                        storeAccess: {
                            include: { store: true }
                        }
                    }
                });

                if (user && user.isActive && await bcrypt.compare(credentials.password, user.password)) {
                    // Update last login
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { lastLoginAt: new Date() }
                    });

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: "USER",
                        userRole: user.role,
                        storeAccess: user.storeAccess.map(sa => ({
                            storeId: sa.storeId,
                            storeName: sa.store.name,
                            canEdit: sa.canEdit,
                            canPlay: sa.canPlay,
                            canSchedule: sa.canSchedule,
                        })),
                    };
                }

                // Check Admin (legacy)
                const admin = await prisma.admin.findUnique({
                    where: { email: credentials.email },
                });

                if (admin && await bcrypt.compare(credentials.password, admin.password)) {
                    return {
                        id: admin.id,
                        email: admin.email,
                        name: admin.name,
                        role: "ADMIN",
                        userRole: "OWNER",
                    };
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.userRole = (user as any).userRole;
                token.storeAccess = (user as any).storeAccess;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).userRole = token.userRole;
                (session.user as any).storeAccess = token.storeAccess;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "aura-secret-fallback-123",
};
