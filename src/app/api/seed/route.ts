import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Route temporaire pour initialiser la DB avec les données récupérées de Cloudinary
// À SUPPRIMER après utilisation !
// v2 - Force redeploy
export async function GET() {
    try {
        // Create Admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        await prisma.admin.upsert({
            where: { email: 'admin@aura.com' },
            update: {},
            create: {
                email: 'admin@aura.com',
                name: 'Super Admin',
                password: adminPassword,
                role: 'ADMIN',
            },
        });

        // Create a test store
        const storePassword = await bcrypt.hash('passy123', 10);
        await prisma.store.upsert({
            where: { email: 'passy@aura.com' },
            update: {},
            create: {
                email: 'passy@aura.com',
                name: 'PASSY',
                password: storePassword,
                role: 'STORE',
                volume: 70,
                isActive: true,
            },
        });

        // Create Styles with recovered Cloudinary URLs
        // Les 4 mixes et 3 covers récupérés de Cloudinary
        const styles = [
            { 
                name: 'Lounge Café', 
                slug: 'lounge-cafe', 
                description: 'Ambiance douce, jazz, piano.', 
                icon: '☕', 
                colorTheme: '#D97706',
                mixUrl: 'https://res.cloudinary.com/dx31tv94m/video/upload/v1767342284/music-streaming/mixes/bxvidhjzq5y0yjwaqbzg.mp3',
                coverUrl: 'https://res.cloudinary.com/dx31tv94m/image/upload/v1767380883/music-streaming/covers/nemrzyc7hzdbellcu6tn.png'
            },
            { 
                name: 'Retail Énergique', 
                slug: 'retail-energique', 
                description: 'Pop instrumentale dynamique.', 
                icon: '🛍️', 
                colorTheme: '#2563EB',
                mixUrl: 'https://res.cloudinary.com/dx31tv94m/video/upload/v1767379489/music-streaming/mixes/rxieialejyhshwwlfmaa.mp3',
                coverUrl: 'https://res.cloudinary.com/dx31tv94m/image/upload/v1767381043/music-streaming/covers/syxxzvwijq8yjzqnzdsg.png'
            },
            { 
                name: 'Spa Relaxation', 
                slug: 'spa-relaxation', 
                description: 'Musique zen et méditation.', 
                icon: '🌿', 
                colorTheme: '#059669',
                mixUrl: 'https://res.cloudinary.com/dx31tv94m/video/upload/v1767379827/music-streaming/mixes/aq2qbpnwxqhs5gnqvhsc.mp3',
                coverUrl: 'https://res.cloudinary.com/dx31tv94m/image/upload/v1767381143/music-streaming/covers/uiiity2rvyamkkcxi7vk.png'
            },
            { 
                name: 'Restaurant Chic', 
                slug: 'restaurant-chic', 
                description: 'Classique moderne et jazz.', 
                icon: '🍷', 
                colorTheme: '#7C3AED',
                mixUrl: 'https://res.cloudinary.com/dx31tv94m/video/upload/v1767380117/music-streaming/mixes/nnz54rggsf6l98wnlxwc.mp3',
                coverUrl: null
            },
            { 
                name: 'Boutique Tendance', 
                slug: 'boutique-tendance', 
                description: 'Indie et électro soft.', 
                icon: '✨', 
                colorTheme: '#DB2777',
                mixUrl: null,
                coverUrl: null
            },
        ];

        for (const style of styles) {
            await prisma.musicStyle.upsert({
                where: { slug: style.slug },
                update: { 
                    mixUrl: style.mixUrl, 
                    coverUrl: style.coverUrl,
                    name: style.name,
                    description: style.description,
                    icon: style.icon,
                    colorTheme: style.colorTheme
                },
                create: { ...style, duration: 3600 },
            });
        }

        const stylesCount = await prisma.musicStyle.count();
        const adminsCount = await prisma.admin.count();
        const storesCount = await prisma.store.count();

        return NextResponse.json({
            success: true,
            message: "Database seeded with recovered Cloudinary data!",
            data: { styles: stylesCount, admins: adminsCount, stores: storesCount },
            credentials: {
                admin: { email: "admin@aura.com", password: "admin123" },
                store: { email: "passy@aura.com", password: "passy123" }
            },
            recoveredFiles: {
                mixes: 4,
                covers: 3
            }
        });
    } catch (error: any) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
