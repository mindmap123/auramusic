# Aura - Music Streaming Platform for Stores

Application de streaming musical pour commerces. Permet aux gérants de diffuser de la musique d'ambiance personnalisée.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Storage**: Cloudinary (audio + images)
- **Styling**: CSS Modules

## Setup Local

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed database (optional)
npx prisma db seed

# Start dev server
npm run dev
```

## Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Deploy on Vercel

1. Push to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy

## Default Credentials

**Admin**: admin@aura.com / admin123

## Features

- 🎵 Music streaming with style selection
- 🏪 Multi-store management
- 📊 Analytics dashboard
- ⏰ Scheduled programming
- 🎨 Cover art support
- 📱 iPad-optimized interface
# Force redeploy
