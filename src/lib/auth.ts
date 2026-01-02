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
                    };
                }

                // Check Admin
                const admin = await prisma.admin.findUnique({
                    where: { email: credentials.email },
                });

                if (admin && await bcrypt.compare(credentials.password, admin.password)) {
                    return {
                        id: admin.id,
                        email: admin.email,
                        name: admin.name,
                        role: "ADMIN",
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
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
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
