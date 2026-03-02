# 🔐 Système de Session Unique

## Vue d'ensemble

Aura Music implémente un système de session unique par compte store, similaire à Netflix, Spotify, ou d'autres services SaaS. Cela signifie qu'un seul appareil peut être connecté à un compte store à la fois.

## Comment ça fonctionne

### 1. Connexion

Quand un utilisateur se connecte :
- Un token de session unique est généré
- Ce token est stocké dans la base de données (champ `activeSessionToken`)
- Le token est inclus dans la session NextAuth de l'utilisateur

### 2. Vérification continue

Pendant que l'utilisateur utilise l'application :
- Toutes les 30 secondes, une vérification de session est effectuée
- Si le token ne correspond plus (quelqu'un d'autre s'est connecté), l'utilisateur est déconnecté

### 3. Nouvelle connexion ailleurs

Si quelqu'un essaie de se connecter avec le même compte :
- Un nouveau token est généré
- L'ancien token devient invalide
- L'utilisateur précédent est automatiquement déconnecté

## Architecture technique

### Base de données

```prisma
model Store {
  activeSessionToken  String?    // Token de la session active
  sessionStartedAt    DateTime?  // Quand la session a démarré
  // ... autres champs
}
```

### Composants clés

1. **`src/lib/sessionManager.ts`**
   - `createStoreSession()` - Crée une nouvelle session
   - `validateStoreSession()` - Vérifie si un token est valide
   - `endStoreSession()` - Termine une session

2. **`src/lib/sessionMiddleware.ts`**
   - Middleware pour vérifier la session sur les API stores
   - Retourne une erreur 401 avec code `SESSION_CONFLICT` si invalide

3. **`src/hooks/useSessionCheck.ts`**
   - Hook React qui vérifie la session toutes les 30 secondes
   - Déconnecte automatiquement si conflit détecté

4. **`src/components/SessionConflictModal.tsx`**
   - Modal affiché quand un conflit est détecté
   - Informe l'utilisateur avant la déconnexion

### Flux de vérification

```
User Login
    ↓
Generate Session Token
    ↓
Store in Database + NextAuth Session
    ↓
Every 30s: Check Token
    ↓
Token Valid? → Continue
    ↓
Token Invalid? → Show Modal → Disconnect
```

## APIs protégées

Les APIs suivantes vérifient la session :
- `/api/stores/me` - Données du store
- Toutes les APIs qui utilisent `validateStoreSessionMiddleware()`

## Messages utilisateur

### Modal de conflit
```
Compte utilisé ailleurs
Votre compte est actuellement utilisé sur un autre appareil.
Vous allez être déconnecté dans quelques instants...
```

### Page de login
```
⚠️ Compte utilisé ailleurs
Votre compte a été utilisé sur un autre appareil. 
Reconnectez-vous pour continuer.
```

## Configuration

### Intervalle de vérification

Par défaut : 30 secondes

Pour modifier :
```tsx
// Dans DashboardContent.tsx
const { sessionConflict } = useSessionCheck(30000); // 30 secondes
```

### Désactiver pour les tests

Pour désactiver temporairement (développement uniquement) :
```tsx
// Commenter cette ligne dans DashboardContent.tsx
// const { sessionConflict } = useSessionCheck(30000);
```

## Cas d'usage

### Scénario 1 : Connexion simultanée
1. User A se connecte sur Appareil 1
2. User A se connecte sur Appareil 2
3. Appareil 1 détecte le conflit après max 30s
4. Appareil 1 affiche le modal et déconnecte
5. Appareil 2 continue normalement

### Scénario 2 : Reconnexion
1. User A est déconnecté pour conflit
2. User A revient sur la page de login
3. Message d'avertissement affiché
4. User A se reconnecte
5. Nouvelle session créée

## Sécurité

- Les tokens sont générés avec `crypto.randomBytes(32)` (256 bits)
- Les tokens sont stockés en base de données, pas en cookie
- Vérification côté serveur à chaque requête API
- Pas de possibilité de contourner la vérification côté client

## Monitoring

Pour voir les sessions actives dans l'admin :
```sql
SELECT 
  name, 
  email, 
  activeSessionToken IS NOT NULL as has_active_session,
  sessionStartedAt
FROM "Store"
WHERE activeSessionToken IS NOT NULL;
```

## Améliorations futures

- [ ] Afficher l'appareil/IP de la session active
- [ ] Permettre de déconnecter les autres sessions depuis les paramètres
- [ ] Historique des connexions
- [ ] Notifications push lors de nouvelle connexion
- [ ] Option "Se souvenir de cet appareil" (session de confiance)

## Dépannage

### L'utilisateur est déconnecté trop souvent
- Vérifier que le token est bien persisté dans NextAuth
- Vérifier les logs serveur pour les erreurs de validation

### La vérification ne fonctionne pas
- Vérifier que `useSessionCheck` est bien appelé dans DashboardContent
- Vérifier que l'API `/api/stores/me` utilise le middleware

### Erreur "Session invalide"
- Le token n'est pas présent dans la session NextAuth
- Déconnexion/reconnexion nécessaire
