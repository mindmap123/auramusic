# Plan d'Implémentation: Store Deletion and Precise Tracking

## Vue d'Ensemble

Ce plan implémente deux fonctionnalités critiques pour l'admin Aura Music : la suppression fiable des stores avec cascade delete et le tracking précis des heures d'écoute avec détection des sessions simultanées. L'implémentation suit une approche incrémentale en commençant par la migration de base de données (critique), puis les APIs backend, et enfin le frontend.

## Tâches

- [x] 1. Migration de base de données pour cascade delete
  - [x] 1.1 Modifier le schéma Prisma pour ajouter onDelete: Cascade sur PlaySession
    - Ouvrir `prisma/schema.prisma`
    - Localiser le modèle PlaySession
    - Ajouter `onDelete: Cascade` à la relation `store`
    - _Requirements: 7.1_
  
  - [x] 1.2 Générer et appliquer la migration Prisma
    - Exécuter `npx prisma migrate dev --name add-cascade-delete-play-session`
    - Vérifier que la migration est créée sans erreur
    - Confirmer que les données existantes sont préservées
    - _Requirements: 7.7_
  
  - [ ]* 1.3 Écrire un test de propriété pour le cascade delete
    - **Property 1: Cascade Delete Completeness**
    - **Valide: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**

- [x] 2. Améliorer l'API DELETE pour les stores
  - [x] 2.1 Modifier l'endpoint DELETE /api/admin/stores/[id]
    - Ouvrir `src/app/api/admin/stores/[id]/route.ts`
    - Améliorer la gestion d'erreur avec vérification d'existence du store
    - Ajouter la détection des erreurs de contrainte (code P2003)
    - Ajouter le logging des suppressions réussies
    - Retourner des messages d'erreur descriptifs
    - _Requirements: 1.7, 1.8, 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 2.2 Écrire des tests unitaires pour l'API DELETE
    - Tester la suppression réussie d'un store avec PlaySession
    - Tester l'erreur 404 pour store inexistant
    - Tester l'erreur 401 pour utilisateur non autorisé
    - _Requirements: 1.8, 2.1_
  
  - [ ]* 2.3 Écrire un test de propriété pour la réponse de suppression
    - **Property 2: Successful Deletion Response**
    - **Valide: Requirements 1.8**

- [-] 3. Créer l'API de statistiques de sessions
  - [x] 3.1 Créer l'endpoint GET /api/admin/stores/[id]/stats
    - Créer le fichier `src/app/api/admin/stores/[id]/stats/route.ts`
    - Implémenter la récupération de toutes les PlaySession du store
    - Calculer la durée des sessions actives (maintenant - startedAt)
    - Calculer la durée des sessions terminées (totalPlayed ou endedAt - startedAt)
    - Compter les sessions actives (endedAt === null)
    - Calculer le total des heures d'écoute
    - Détecter les sessions simultanées (activeSessions > 1)
    - Retourner les statistiques au format JSON
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2_
  
  - [ ]* 3.2 Écrire des tests de propriété pour les calculs de durée
    - **Property 4: Active Session Duration Calculation**
    - **Valide: Requirements 3.1**
  
  - [ ]* 3.3 Écrire des tests de propriété pour la cohérence des sessions terminées
    - **Property 5: Completed Session Duration Consistency**
    - **Valide: Requirements 3.2, 6.2**
  
  - [ ]* 3.4 Écrire des tests de propriété pour le calcul total
    - **Property 6: Total Listening Hours Calculation**
    - **Valide: Requirements 3.3**
  
  - [ ]* 3.5 Écrire des tests de propriété pour la détection de sessions simultanées
    - **Property 8: Concurrent Sessions Detection**
    - **Valide: Requirements 4.2**

- [-] 4. Créer l'API d'historique des sessions
  - [x] 4.1 Créer l'endpoint GET /api/admin/stores/[id]/sessions
    - Créer le fichier `src/app/api/admin/stores/[id]/sessions/route.ts`
    - Implémenter la récupération des PlaySession avec filtres de date
    - Calculer la durée pour chaque session (active ou terminée)
    - Trier par startedAt décroissant
    - Inclure les informations du style musical
    - Supporter le format JSON par défaut
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 4.2 Ajouter l'export CSV à l'endpoint sessions
    - Détecter le paramètre format=csv
    - Générer le CSV avec colonnes: ID, Style, Started At, Ended At, Duration, Status
    - Retourner avec les headers appropriés (Content-Type, Content-Disposition)
    - _Requirements: 5.4_
  
  - [ ]* 4.3 Écrire des tests de propriété pour le tri des sessions
    - **Property 11: Sessions Default Sort Order**
    - **Valide: Requirements 5.2**
  
  - [ ]* 4.4 Écrire des tests de propriété pour le filtrage par date
    - **Property 12: Sessions Date Filtering**
    - **Valide: Requirements 5.3**
  
  - [ ]* 4.5 Écrire des tests de propriété pour le format CSV
    - **Property 13: CSV Export Format**
    - **Valide: Requirements 5.4**

- [ ] 5. Checkpoint - Vérifier que les APIs fonctionnent
  - Tester manuellement les 3 endpoints créés
  - Vérifier que la suppression fonctionne avec cascade delete
  - Vérifier que les statistiques sont calculées correctement
  - S'assurer que l'export CSV fonctionne
  - Demander à l'utilisateur si des questions se posent

- [-] 6. Mettre à jour le frontend StoresContent
  - [x] 6.1 Ajouter les colonnes de statistiques au tableau
    - Ouvrir `src/app/admin/stores/StoresContent.tsx`
    - Ajouter l'interface Store avec le champ stats optionnel
    - Créer la fonction fetchStoresWithStats pour charger les stats de chaque store
    - Ajouter la colonne "Sessions actives" avec indicateur de sessions simultanées
    - Ajouter la colonne "Heures d'écoute"
    - Ajouter un bouton pour voir l'historique des sessions (icône Activity)
    - _Requirements: 3.3, 4.1, 4.3_
  
  - [x] 6.2 Améliorer la gestion d'erreur de suppression
    - Modifier handleDelete pour afficher les messages d'erreur détaillés
    - Afficher le message de succès après suppression
    - Rafraîchir la liste après suppression réussie
    - _Requirements: 2.1, 2.3_
  
  - [ ]* 6.3 Écrire des tests de propriété pour l'indicateur visuel
    - **Property 9: Concurrent Sessions Visual Indicator**
    - **Valide: Requirements 4.3**

- [x] 7. Créer le composant SessionsModal
  - [x] 7.1 Créer le composant SessionsModal
    - Créer le fichier `src/app/admin/stores/SessionsModal.tsx`
    - Implémenter l'interface SessionsModalProps (storeId, storeName, onClose)
    - Créer l'état pour les sessions, loading, startDate, endDate
    - Implémenter fetchSessions avec support des filtres de date
    - Afficher le tableau des sessions avec colonnes: Style, Début, Fin, Durée, Statut
    - Formater les dates en français (toLocaleString)
    - Formater les durées en heures et minutes
    - Afficher un indicateur "En cours" pour les sessions actives
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 7.2 Ajouter les filtres de date au modal
    - Ajouter deux inputs de type date pour startDate et endDate
    - Déclencher fetchSessions lors du changement des filtres
    - Afficher une icône Calendar pour les filtres
    - _Requirements: 5.3_
  
  - [x] 7.3 Ajouter le bouton d'export CSV
    - Créer handleExportCSV qui construit l'URL avec format=csv
    - Inclure les filtres de date dans l'URL d'export
    - Utiliser window.location.href pour déclencher le téléchargement
    - Afficher une icône Download sur le bouton
    - _Requirements: 5.4_
  
  - [x] 7.4 Ajouter le fichier CSS pour SessionsModal
    - Créer `src/app/admin/stores/SessionsModal.module.css`
    - Styliser l'overlay, le modal, le header, les filtres
    - Styliser le tableau des sessions
    - Ajouter les styles pour les badges (active, completed)
    - Ajouter les styles pour le footer avec le résumé

- [-] 8. Intégrer SessionsModal dans StoresContent
  - [x] 8.1 Ajouter l'état et les handlers pour le modal
    - Ajouter l'état selectedStore pour le store sélectionné
    - Créer openSessionsModal pour ouvrir le modal
    - Créer closeSessionsModal pour fermer le modal
    - Importer et afficher SessionsModal conditionnellement
    - _Requirements: 5.1_

- [ ] 9. Checkpoint final - Tests et validation
  - Tester le flux complet de suppression d'un store
  - Vérifier l'affichage des statistiques dans le tableau
  - Tester l'ouverture du modal des sessions
  - Tester les filtres de date dans le modal
  - Tester l'export CSV
  - Vérifier l'indicateur de sessions simultanées
  - S'assurer que tous les tests passent
  - Demander à l'utilisateur si des questions se posent

## Notes

- Les tâches marquées avec `*` sont optionnelles et peuvent être sautées pour un MVP plus rapide
- La migration de base de données (tâche 1) est critique et doit être effectuée en premier
- Chaque tâche référence les requirements spécifiques pour la traçabilité
- Les tests de propriété valident les propriétés universelles de correctness
- Les checkpoints permettent une validation incrémentale
