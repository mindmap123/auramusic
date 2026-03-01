# 🎵 Aura Music - Streaming Musical pour Commerces

Plateforme B2B de streaming musical automatisé pour espaces commerciaux avec gestion centralisée et programmation horaire.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 Qu'est-ce qu'Aura Music ?

Aura Music est une solution SaaS qui permet aux commerces de diffuser de la musique d'ambiance professionnelle avec :

- **Mixes continus** par style musical (Jazz, Lounge, Chill, etc.)
- **Programmation automatique** selon l'heure de la journée
- **Gestion multi-magasins** depuis un dashboard centralisé
- **Interface dédiée** pour chaque point de vente
- **Analytics en temps réel** sur l'écoute et l'utilisation

---

## ✨ Fonctionnalités

### 🎛️ Dashboard Admin
- Gestion des styles musicaux et mixes
- Upload et organisation des fichiers audio
- Création et gestion des magasins
- Programmation horaire automatique
- Analytics et statistiques d'écoute
- Gestion d'équipe (Admin, Manager, Éditeur)

### 🏪 Interface Magasin
- Player audio responsive (desktop + mobile)
- Sélection manuelle ou automatique des styles
- Contrôles de lecture (play/pause, volume, seek)
- Favoris personnalisables
- Thèmes de couleur personnalisables

### 📊 Analytics
- Heures d'écoute par magasin
- Styles les plus populaires
- Historique d'activité
- Graphiques et statistiques

---

## 🛠️ Stack Technique

### Frontend
- **Next.js 16** (App Router)
- **React 19** avec TypeScript
- **Zustand** pour la gestion d'état
- **Recharts** pour les graphiques
- **CSS Modules** pour le styling

### Backend
- **Next.js API Routes**
- **NextAuth.js** pour l'authentification
- **Prisma ORM** avec PostgreSQL
- **Cloudinary** pour le stockage média

### Infrastructure
- **Vercel** pour l'hébergement
- **Vercel Postgres** pour la base de données
- **Cloudinary** pour les assets

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 15+
- Compte Cloudinary
- Compte Vercel (optionnel)

### 1. Cloner le projet

```bash
git clone https://github.com/mindmap123/auramusic.git
cd auramusic
npm install
```

### 2. Configuration

Copie `.env.example` vers `.env.local` et configure les variables :

```bash
cp .env.example .env.local
```

Voir [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) pour les détails complets.

### 3. Base de données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# (Optionnel) Seed avec des données de test
npx prisma db seed
```

### 4. Lancer en développement

```bash
npm run dev
```

Ouvre http://localhost:3000

---

## 📁 Structure du Projet

```
auramusic/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   ├── migrations/            # Migrations SQL
│   └── seed.ts               # Données de test
├── public/
│   └── images/               # Assets statiques
├── src/
│   ├── app/
│   │   ├── admin/           # Dashboard admin
│   │   ├── dashboard/       # Interface magasin
│   │   ├── api/            # API Routes
│   │   └── layout.tsx      # Layout principal
│   ├── components/
│   │   ├── Auth/           # Composants d'authentification
│   │   ├── Layout/         # Layout components
│   │   └── Player/         # Composants audio
│   ├── lib/
│   │   ├── auth.ts         # Configuration NextAuth
│   │   ├── prisma.ts       # Client Prisma
│   │   ├── cloudinary.ts   # Configuration Cloudinary
│   │   └── audioManager.ts # Gestion audio
│   ├── store/
│   │   └── usePlayerStore.ts # Store Zustand
│   └── hooks/              # Custom hooks
├── DEPLOYMENT_GUIDE.md     # Guide de déploiement
├── ACTIONS_CRITIQUES.md    # Actions de sécurité
└── AUDIT_COMMERCIALISATION.md # Audit complet
```

---

## 🔐 Sécurité

### Variables d'environnement critiques

```env
NEXTAUTH_SECRET=<généré avec openssl rand -base64 32>
NEXTAUTH_URL=<URL de production>
POSTGRES_PRISMA_URL=<connexion PostgreSQL>
CLOUDINARY_API_SECRET=<secret Cloudinary>
```

⚠️ **Ne commit JAMAIS les fichiers `.env*`** (sauf `.env.example`)

### Authentification

- NextAuth.js avec stratégie Credentials
- Sessions JWT sécurisées
- Middleware de protection des routes
- Rôles utilisateurs (ADMIN, MANAGER, EDITOR, STORE)

---

## 📊 Modèle de Données

### Entités principales

- **User** - Utilisateurs admin/managers
- **Store** - Points de vente
- **Style** - Styles musicaux (Jazz, Lounge, etc.)
- **Mix** - Fichiers audio par style
- **Schedule** - Programmation horaire
- **Activity** - Logs d'activité
- **Favorite** - Favoris des magasins

Voir `prisma/schema.prisma` pour le schéma complet.

---

## 🎨 Personnalisation

### Thèmes de couleur

L'app supporte 7 thèmes :
- Green (défaut)
- Violet
- Blue
- Orange
- Pink
- Red
- Cyan

Chaque magasin peut choisir son thème dans les paramètres.

### Styles musicaux

Ajoute de nouveaux styles via le dashboard admin :
1. Admin → Radios & Mixes
2. Créer un nouveau style
3. Upload des mixes audio
4. Configurer la pochette

---

## 🧪 Tests

```bash
# Linter
npm run lint

# Build de production
npm run build

# Vérifier la base de données
npx prisma studio
```

---

## 📈 Performance

### Optimisations implémentées

- ✅ Singleton audio pour éviter les fuites mémoire
- ✅ Preload des mixes pour lecture instantanée
- ✅ Images optimisées avec Next.js Image
- ✅ CSS Modules pour un bundle minimal
- ✅ API Routes avec cache approprié
- ✅ Prisma connection pooling

### Métriques cibles

- Lighthouse Performance: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Cumulative Layout Shift: < 0.1

---

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

Voir [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) pour les instructions complètes.

### Autres plateformes

L'app peut être déployée sur :
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

---

## 📝 Roadmap

### Version 1.1
- [ ] Rate limiting sur les API
- [ ] Monitoring avec Sentry
- [ ] Analytics avancés
- [ ] Export de rapports PDF
- [ ] API publique pour intégrations

### Version 2.0
- [ ] Application mobile native
- [ ] Playlists personnalisées
- [ ] IA pour recommandations
- [ ] Multi-langue
- [ ] Mode offline

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Crée une branche (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

---

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 📞 Support

Pour toute question ou problème :

1. Consulte [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Vérifie [ACTIONS_CRITIQUES.md](./ACTIONS_CRITIQUES.md)
3. Ouvre une issue sur GitHub
4. Contacte l'équipe de développement

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org) pour le framework
- [Vercel](https://vercel.com) pour l'hébergement
- [Cloudinary](https://cloudinary.com) pour le stockage média
- [Prisma](https://prisma.io) pour l'ORM
- La communauté open source

---

**Fait avec ❤️ pour les commerces qui veulent une ambiance musicale professionnelle**
