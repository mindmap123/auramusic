import { randomBytes } from 'crypto';
import prisma from './prisma';

/**
 * Génère un token de session unique
 */
export function generateSessionToken(): string {
    return randomBytes(32).toString('hex');
}

/**
 * Crée une nouvelle session pour un store et invalide les sessions précédentes
 */
export async function createStoreSession(storeId: string): Promise<string> {
    const sessionToken = generateSessionToken();
    
    await prisma.store.update({
        where: { id: storeId },
        data: {
            activeSessionToken: sessionToken,
            sessionStartedAt: new Date(),
        },
    });
    
    console.log(`[SessionManager] New session created for store ${storeId}`);
    return sessionToken;
}

/**
 * Vérifie si le token de session est valide
 * Retourne true si valide, false sinon
 */
export async function validateStoreSession(storeId: string, sessionToken: string): Promise<boolean> {
    const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { activeSessionToken: true },
    });
    
    if (!store) {
        return false;
    }
    
    // Pas de session active = première connexion, on accepte
    if (!store.activeSessionToken) {
        return true;
    }
    
    // Vérifier si le token correspond
    const isValid = store.activeSessionToken === sessionToken;
    
    if (!isValid) {
        console.log(`[SessionManager] Invalid session token for store ${storeId}`);
    }
    
    return isValid;
}

/**
 * Termine la session d'un store
 */
export async function endStoreSession(storeId: string): Promise<void> {
    await prisma.store.update({
        where: { id: storeId },
        data: {
            activeSessionToken: null,
            sessionStartedAt: null,
        },
    });
    
    console.log(`[SessionManager] Session ended for store ${storeId}`);
}

/**
 * Récupère les informations de session d'un store
 */
export async function getStoreSessionInfo(storeId: string) {
    const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
            activeSessionToken: true,
            sessionStartedAt: true,
        },
    });
    
    return store;
}
