import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
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

    // Create Styles with placeholder 1h mixes (Royalty free examples or placeholders)
    const styles = [
        {
            name: 'Lounge Café',
            slug: 'lounge-cafe',
            description: 'Ambiance douce, jazz, piano pour une atmosphère relaxante.',
            icon: '☕',
            colorTheme: '#D97706',
            mixUrl: null,
            duration: 3600
        },
        {
            name: 'Retail Énergique',
            slug: 'retail-energique',
            description: 'Pop instrumentale et rythmes dynamiques pour booster les ventes.',
            icon: '🛍️',
            colorTheme: '#2563EB',
            mixUrl: null,
            duration: 3600
        },
        {
            name: 'Spa Relaxation',
            slug: 'spa-relaxation',
            description: 'Musique zen, bruits de la nature et méditation.',
            icon: '🌿',
            colorTheme: '#059669',
            mixUrl: null,
            duration: 3600
        },
        {
            name: 'Restaurant Chic',
            slug: 'restaurant-chic',
            description: 'Classique moderne et jazz élégant.',
            icon: '🍷',
            colorTheme: '#7C3AED',
            mixUrl: null,
            duration: 3600
        },
        {
            name: 'Boutique Tendance',
            slug: 'boutique-tendance',
            description: 'Indie, électro soft et morceaux actuels.',
            icon: '✨',
            colorTheme: '#DB2777',
            mixUrl: null,
            duration: 3600
        }
    ];

    for (const style of styles) {
        await prisma.musicStyle.upsert({
            where: { slug: style.slug },
            update: style,
            create: style,
        });
    }

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
