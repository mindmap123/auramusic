# 🚀 Guide de Déploiement - Aura Music

## 📋 Prérequis

- Node.js 18+ et npm
- Compte Vercel (ou autre hébergeur Next.js)
- Base de données PostgreSQL
- Compte Cloudinary

---

## 🔧 Configuration Locale

### 1. Cloner le projet

```bash
git clone https://github.com/mindmap123/auramusic.git
cd auramusic
npm install
```

### 2. Créer le fichier `.env.local`

Copie `.env.example` vers `.env.local` et remplis les valeurs :

```bash
cp .env.example .env.local
```

### 3. Variables d'environnement requises

```env
# ===== BASE DE DONNÉES =====
# PostgreSQL avec pooling (pour Vercel/production)
POSTGRES_PRISMA_URL="postgresql://user:password@host:5432/database?sslmode=require&pgbouncer=true"

# PostgreSQL sans pooling (pour migrations)
POSTGRES_URL_NON_POOLING="postgresql://user:password@host:5432/database?sslmode=require"

# Alternative locale (développement)
DATABASE_URL="postgresql://user:password@localhost:5432/auramusic"

# ===== AUTHENTIFICATION =====
# Générer avec: openssl rand -base64 32
NEXTAUTH_SECRET="ton-secret-genere-ici"

# URL de l'application
NEXTAUTH_URL="http://localhost:3000"  # Dev
# NEXTAUTH_URL="https://ton-domaine.com"  # Production

# ===== CLOUDINARY =====
# Pour le stockage des fichiers audio et images
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="ton-cloud-name"
CLOUDINARY_API_KEY="ta-api-key"
CLOUDINARY_API_SECRET="ton-api-secret"
CLOUDINARY_WEBHOOK_SECRET="ton-webhook-secret"  # Optionnel
```

---

## 🗄️ Configuration de la Base de Données

### Option 1 : PostgreSQL Local

```bash
# Installer PostgreSQL
brew install postgresql  # macOS
# ou apt-get install postgresql  # Linux

# Démarrer PostgreSQL
brew services start postgresql

# Créer la base de données
createdb auramusic

# Configurer DATABASE_URL dans .env.local
DATABASE_URL="postgresql://localhost:5432/auramusic"
```

### Option 2 : Vercel Postgres (Recommandé pour production)

1. Va sur https://vercel.com/dashboard
2. Sélectionne ton projet
3. Onglet "Storage" → "Create Database" → "Postgres"
4. Copie les variables `POSTGRES_PRISMA_URL` et `POSTGRES_URL_NON_POOLING`
5. Ajoute-les dans `.env.local` et dans Vercel Environment Variables

### Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# (Optionnel) Seed avec des données de test
npx prisma db seed
```

---

## ☁️ Configuration Cloudinary

### 1. Créer un compte

1. Va sur https://cloudinary.com/users/register/free
2. Crée un compte gratuit (25 GB de stockage)

### 2. Récupérer les credentials

1. Dashboard → Settings → Access Keys
2. Copie :
   - **Cloud Name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

### 3. Configurer les dossiers

Dans Cloudinary, crée ces dossiers :
- `/aura/covers` - Pour les pochettes d'albums
- `/aura/mixes` - Pour les fichiers audio

### 4. Webhook (Optionnel)

Pour recevoir des notifications quand un upload est terminé :

1. Settings → Webhooks → Add Notification URL
2. URL : `https://ton-domaine.com/api/webhook/cloudinary`
3. Events : `upload`, `delete`
4. Copie le **Signing Secret** → `CLOUDINARY_WEBHOOK_SECRET`

---

## 🔐 Générer NEXTAUTH_SECRET

```bash
# Sur macOS/Linux
openssl rand -base64 32

# Sur Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copie le résultat dans `NEXTAUTH_SECRET`

---

## 🚀 Déploiement sur Vercel

### 1. Connecter le projet

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link
```

### 2. Configurer les variables d'environnement

**Via le Dashboard** (Recommandé) :
1. https://vercel.com/dashboard → ton projet
2. Settings → Environment Variables
3. Ajoute TOUTES les variables de `.env.local`
4. Coche : Production, Preview, Development

**Via CLI** :
```bash
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add POSTGRES_PRISMA_URL
# ... etc
```

### 3. Déployer

```bash
# Déploiement de test
vercel

# Déploiement en production
vercel --prod
```

### 4. Configurer le domaine

1. Settings → Domains
2. Ajoute ton domaine personnalisé
3. Mets à jour `NEXTAUTH_URL` avec le nouveau domaine
4. Redéploie

---

## 🧪 Tester l'installation

### 1. Lancer en local

```bash
npm run dev
```

Ouvre http://localhost:3000

### 2. Créer le premier utilisateur admin

```bash
# Via Prisma Studio
npx prisma studio

# Ou via SQL direct
psql $DATABASE_URL
```

Crée un utilisateur avec `role = "ADMIN"` :

```sql
INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES (
  'admin-1',
  'admin@auramusic.com',
  'Admin',
  'ADMIN',
  NOW(),
  NOW()
);
```

### 3. Se connecter

1. Va sur `/admin/login`
2. Connecte-toi avec l'email admin
3. Tu devrais voir le dashboard admin

---

## 📦 Structure des données

### Créer un premier style musical

Via l'interface admin ou directement en DB :

```sql
INSERT INTO "Style" (id, name, slug, description, "colorTheme", "createdAt", "updatedAt")
VALUES (
  'style-1',
  'Jazz Lounge',
  'jazz-lounge',
  'Ambiance jazz décontractée',
  'blue',
  NOW(),
  NOW()
);
```

### Uploader un mix audio

1. Va dans l'admin → Radios & Mixes
2. Sélectionne un style
3. Upload un fichier audio (MP3, WAV)
4. Cloudinary va le traiter et générer l'URL

---

## 🔍 Vérifications Post-Déploiement

### Checklist

- [ ] L'app se charge sans erreur
- [ ] La connexion admin fonctionne
- [ ] Les styles s'affichent
- [ ] L'audio se lance correctement
- [ ] Le player mobile fonctionne
- [ ] Les images Cloudinary se chargent
- [ ] La base de données répond
- [ ] Les logs Vercel sont propres

### Commandes utiles

```bash
# Voir les logs en temps réel
vercel logs --follow

# Vérifier l'état de la DB
npx prisma db pull

# Réinitialiser la DB (ATTENTION : efface tout)
npx prisma migrate reset

# Voir les variables d'env configurées
vercel env ls
```

---

## 🆘 Problèmes Courants

### "Invalid `prisma.xxx()` invocation"
→ Vérifie que `DATABASE_URL` est correct
→ Lance `npx prisma generate`

### "NEXTAUTH_SECRET must be provided"
→ Ajoute la variable sur Vercel
→ Redéploie

### "Cloudinary upload failed"
→ Vérifie les credentials Cloudinary
→ Vérifie que les dossiers existent

### "Audio won't play on mobile"
→ Vérifie que les fichiers sont en HTTPS
→ Teste sur un vrai device (pas simulateur)

---

## 📞 Support

Pour toute question :
1. Vérifie les logs : `vercel logs`
2. Vérifie la console navigateur (F12)
3. Vérifie les variables d'environnement
4. Consulte `ACTIONS_CRITIQUES.md` pour les problèmes de sécurité

---

## 🔒 Sécurité

**IMPORTANT** :
- ❌ Ne commit JAMAIS les fichiers `.env*` (sauf `.env.example`)
- ❌ Ne partage JAMAIS tes clés API
- ✅ Utilise des secrets forts (32+ caractères)
- ✅ Active le rate limiting en production
- ✅ Configure un monitoring (Sentry)

---

## 📚 Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [NextAuth Docs](https://next-auth.js.org)
