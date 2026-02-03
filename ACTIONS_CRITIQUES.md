# 🚨 ACTIONS CRITIQUES AVANT PRODUCTION

## ⚠️ SÉCURITÉ - À FAIRE IMMÉDIATEMENT

### 1. NextAuth Secret (CRITIQUE)
**Fichier**: `src/lib/auth.ts` ligne 109

**Problème actuel**:
```typescript
secret: process.env.NEXTAUTH_SECRET || "aura-secret-fallback-123"
```

**❌ DANGER**: Le fallback permet de déployer sans secret réel !

**✅ Solution**:
```typescript
secret: process.env.NEXTAUTH_SECRET!
```

**Actions**:
1. Générer un secret fort: `openssl rand -base64 32`
2. Ajouter à Vercel: Settings → Environment Variables
3. Variable: `NEXTAUTH_SECRET`
4. Valeur: Le secret généré
5. Retirer le fallback du code

---

### 2. Variables d'environnement à vérifier

**Fichiers à checker**:
- `.env.local` (dev)
- `.env.production.local` (prod local)
- Vercel Dashboard (prod)

**Variables critiques**:
```bash
# Auth
NEXTAUTH_SECRET=<générer avec openssl rand -base64 32>
NEXTAUTH_URL=https://votre-domaine.com

# Database
DATABASE_URL=<PostgreSQL connection string>

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<votre cloud>
CLOUDINARY_API_KEY=<votre key>
CLOUDINARY_API_SECRET=<votre secret>
CLOUDINARY_WEBHOOK_SECRET=<votre webhook secret>
```

**Actions**:
- [ ] Vérifier que toutes les variables sont définies en prod
- [ ] Aucun secret dans le code
- [ ] Aucun secret dans Git

---

### 3. Connexions PostgreSQL qui se ferment

**Symptôme détecté**:
```
prisma:error Error in PostgreSQL connection: Error { kind: Closed, cause: None }
```

**Causes possibles**:
1. Pool de connexions saturé
2. Timeout trop court
3. Connexions non fermées

**Solution**:
Optimiser `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

**Actions**:
- [ ] Implémenter le singleton Prisma
- [ ] Configurer le pool de connexions
- [ ] Monitorer les connexions en prod

---

### 4. Rate Limiting (IMPORTANT)

**Problème**: Aucune protection contre les abus API

**Routes à protéger**:
- `/api/auth/*` - Login attempts
- `/api/admin/*` - Admin actions
- `/api/store/*` - Store actions

**Solution**: Implémenter rate limiting

```typescript
// middleware.ts ou dans chaque route
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

**Actions**:
- [ ] Installer `@upstash/ratelimit` et `@upstash/redis`
- [ ] Configurer Upstash Redis
- [ ] Implémenter sur les routes sensibles

---

## 🔧 FIXES TECHNIQUES URGENTS

### 5. Prisma Client Singleton

**Fichier**: `src/lib/prisma.ts`

**Problème**: Multiples instances en dev = connexions qui fuient

**Action**: Vérifier l'implémentation actuelle

---

### 6. Memory Leaks - Event Listeners

**Fichiers à auditer**:
- `src/components/Layout/MobilePlayer.tsx`
- `src/app/dashboard/DashboardContent.tsx`
- `src/lib/audioManager.ts`

**Vérifications**:
- [ ] Tous les `addEventListener` ont un `removeEventListener`
- [ ] Tous les `setInterval` ont un `clearInterval`
- [ ] Tous les `setTimeout` sont nettoyés si nécessaire
- [ ] Les `useEffect` retournent des cleanup functions

---

### 7. Audio Playback - Tests iOS

**Tests requis**:
- [ ] iPhone Safari (iOS 15+)
- [ ] iPhone Chrome
- [ ] iPad Safari
- [ ] Android Chrome
- [ ] Android Firefox

**Points à tester**:
- [ ] Autoplay fonctionne après interaction
- [ ] Pull-to-dismiss ne casse pas l'audio
- [ ] Changement de style fluide
- [ ] Pas de plantage après 5 minutes
- [ ] Volume control fonctionne
- [ ] Seek fonctionne

---

## 📊 MONITORING À CONFIGURER

### 8. Error Tracking

**Recommandation**: Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configuration**:
```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

---

### 9. Analytics

**Options**:
1. Vercel Analytics (simple, intégré)
2. Plausible (privacy-friendly)
3. Google Analytics (complet)

**Métriques à tracker**:
- Nombre de stores actifs
- Temps d'écoute moyen
- Styles les plus populaires
- Taux de conversion
- Erreurs audio

---

## ✅ CHECKLIST FINALE

### Avant le déploiement
- [ ] Tous les secrets configurés en prod
- [ ] Rate limiting actif
- [ ] Prisma optimisé
- [ ] Tests iOS/Android passés
- [ ] Error tracking configuré
- [ ] Analytics configuré
- [ ] Lighthouse score > 90
- [ ] Backup DB configuré

### Après le déploiement
- [ ] Monitorer les erreurs (24h)
- [ ] Vérifier les performances
- [ ] Tester en conditions réelles
- [ ] Backup DB vérifié

---

## 🆘 CONTACTS D'URGENCE

**En cas de problème critique en production**:
1. Rollback immédiat sur Vercel
2. Vérifier les logs Vercel
3. Vérifier Sentry (si configuré)
4. Vérifier la DB

**Commandes utiles**:
```bash
# Rollback Vercel
vercel rollback

# Logs en temps réel
vercel logs --follow

# Status DB
npx prisma db pull
```
