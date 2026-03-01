# Requirements Document

## Introduction

Ce document définit les exigences pour deux fonctionnalités critiques de l'admin Aura Music : la suppression fiable des comptes magasins et le tracking précis des heures d'écoute. Actuellement, la suppression de compte échoue silencieusement à cause de contraintes de relations dans la base de données, et le calcul des heures d'écoute est approximatif. Ces fonctionnalités sont essentielles pour la gestion opérationnelle de la plateforme B2B.

## Glossary

- **Store**: Compte magasin client sur la plateforme Aura Music
- **Admin_System**: Interface d'administration pour gérer les stores
- **PlaySession**: Enregistrement d'une session d'écoute musicale par un store
- **ActivityLog**: Journal des actions effectuées par un store
- **Database**: Base de données PostgreSQL avec Prisma ORM
- **Cascade_Delete**: Suppression automatique des enregistrements liés lors de la suppression d'un parent
- **Listening_Hours**: Heures d'écoute réelles calculées à partir des sessions de lecture
- **Concurrent_Sessions**: Sessions d'écoute simultanées du même store sur plusieurs appareils
- **StoreFavorite**: Style musical favori d'un store
- **StoreSchedule**: Programmation horaire des styles musicaux pour un store
- **StoreStyleProgress**: Progression de lecture d'un style musical pour un store
- **UserStoreAccess**: Permissions d'accès utilisateur à un store spécifique

## Requirements

### Requirement 1: Suppression Complète de Store

**User Story:** En tant qu'administrateur, je veux supprimer complètement un compte store, afin de retirer toutes ses données de la plateforme sans laisser d'enregistrements orphelins.

#### Acceptance Criteria

1. WHEN un administrateur demande la suppression d'un store, THE Admin_System SHALL supprimer toutes les PlaySession associées avant de supprimer le store
2. WHEN un administrateur demande la suppression d'un store, THE Database SHALL supprimer automatiquement tous les ActivityLog associés via cascade delete
3. WHEN un administrateur demande la suppression d'un store, THE Database SHALL supprimer automatiquement tous les StoreFavorite associés via cascade delete
4. WHEN un administrateur demande la suppression d'un store, THE Database SHALL supprimer automatiquement tous les StoreSchedule associés via cascade delete
5. WHEN un administrateur demande la suppression d'un store, THE Database SHALL supprimer automatiquement tous les StoreStyleProgress associés via cascade delete
6. WHEN un administrateur demande la suppression d'un store, THE Database SHALL supprimer automatiquement tous les UserStoreAccess associés via cascade delete
7. WHEN toutes les relations sont supprimées, THE Admin_System SHALL supprimer l'enregistrement Store de la base de données
8. WHEN la suppression est terminée, THE Admin_System SHALL retourner une confirmation de succès

### Requirement 2: Gestion des Erreurs de Suppression

**User Story:** En tant qu'administrateur, je veux être informé si une suppression échoue, afin de comprendre le problème et prendre les mesures appropriées.

#### Acceptance Criteria

1. IF la suppression d'un store échoue, THEN THE Admin_System SHALL retourner un message d'erreur descriptif
2. IF la suppression d'un store échoue, THEN THE Admin_System SHALL logger l'erreur avec les détails de l'échec
3. IF une contrainte de base de données empêche la suppression, THEN THE Admin_System SHALL identifier la relation problématique dans le message d'erreur
4. WHEN une erreur de suppression se produit, THE Admin_System SHALL maintenir l'intégrité des données existantes

### Requirement 3: Tracking Précis des Heures d'Écoute

**User Story:** En tant qu'administrateur, je veux connaître les heures d'écoute exactes de chaque store, afin de facturer correctement et analyser l'utilisation de la plateforme.

#### Acceptance Criteria

1. WHEN une PlaySession est active, THE Admin_System SHALL calculer la durée d'écoute en temps réel basée sur startedAt et l'heure actuelle
2. WHEN une PlaySession se termine, THE Admin_System SHALL enregistrer la durée exacte dans totalPlayed basée sur startedAt et endedAt
3. WHEN un administrateur consulte les statistiques d'un store, THE Admin_System SHALL afficher le total des heures d'écoute cumulées de toutes les PlaySession
4. THE Admin_System SHALL calculer les heures d'écoute avec une précision à la seconde près
5. WHEN une PlaySession est interrompue anormalement, THE Admin_System SHALL enregistrer la durée jusqu'au dernier heartbeat connu

### Requirement 4: Détection des Sessions Simultanées

**User Story:** En tant qu'administrateur, je veux détecter quand un store a plusieurs sessions actives simultanément, afin d'identifier les usages multi-appareils et détecter les abus potentiels.

#### Acceptance Criteria

1. WHEN un administrateur consulte un store, THE Admin_System SHALL compter le nombre de PlaySession actives (endedAt est null) pour ce store
2. WHEN un store a plus d'une PlaySession active, THE Admin_System SHALL marquer ce store comme ayant des sessions simultanées
3. WHEN un administrateur consulte la liste des stores, THE Admin_System SHALL afficher un indicateur visuel pour les stores avec sessions simultanées
4. THE Admin_System SHALL calculer le nombre maximum de sessions simultanées observées pour chaque store sur une période donnée

### Requirement 5: Historique des Sessions d'Écoute

**User Story:** En tant qu'administrateur, je veux consulter l'historique complet des sessions d'écoute d'un store, afin d'analyser les patterns d'utilisation et résoudre les problèmes de facturation.

#### Acceptance Criteria

1. WHEN un administrateur consulte un store, THE Admin_System SHALL afficher toutes les PlaySession avec leur date de début, date de fin, et durée
2. THE Admin_System SHALL trier les PlaySession par date de début décroissante par défaut
3. WHEN un administrateur filtre par période, THE Admin_System SHALL afficher uniquement les PlaySession dans la plage de dates spécifiée
4. WHEN un administrateur exporte les données, THE Admin_System SHALL générer un rapport CSV avec toutes les PlaySession du store

### Requirement 6: Validation de l'Intégrité des Données

**User Story:** En tant qu'administrateur, je veux m'assurer que les données de tracking sont cohérentes, afin de garantir la fiabilité des statistiques et de la facturation.

#### Acceptance Criteria

1. WHEN une PlaySession a un endedAt, THE Admin_System SHALL vérifier que endedAt est postérieur à startedAt
2. WHEN une PlaySession a un totalPlayed, THE Admin_System SHALL vérifier que totalPlayed correspond à la différence entre endedAt et startedAt
3. IF une incohérence est détectée dans une PlaySession, THEN THE Admin_System SHALL logger un avertissement avec les détails de l'incohérence
4. THE Admin_System SHALL fournir un outil de diagnostic pour identifier et corriger les PlaySession avec des données incohérentes

### Requirement 7: Migration du Schéma de Base de Données

**User Story:** En tant que développeur, je veux mettre à jour le schéma Prisma pour supporter la suppression en cascade, afin que les contraintes de base de données soient correctement configurées.

#### Acceptance Criteria

1. THE Database SHALL définir onDelete Cascade pour la relation PlaySession vers Store
2. THE Database SHALL maintenir onDelete Cascade pour la relation ActivityLog vers Store
3. THE Database SHALL maintenir onDelete Cascade pour la relation StoreFavorite vers Store
4. THE Database SHALL maintenir onDelete Cascade pour la relation StoreSchedule vers Store
5. THE Database SHALL maintenir onDelete Cascade pour la relation StoreStyleProgress vers Store
6. THE Database SHALL maintenir onDelete Cascade pour la relation UserStoreAccess vers Store
7. WHEN le schéma est modifié, THE Admin_System SHALL générer et appliquer une migration Prisma sans perte de données

