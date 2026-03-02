import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';

/**
 * Hook pour vérifier périodiquement si la session est toujours valide
 * Si le compte est utilisé ailleurs, déconnecte automatiquement
 */
export function useSessionCheck(intervalMs: number = 30000) {
    const [sessionConflict, setSessionConflict] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/stores/me', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}), // Requête vide juste pour vérifier la session
                });

                if (res.status === 401) {
                    const data = await res.json();
                    if (data.code === 'SESSION_CONFLICT') {
                        setSessionConflict(true);
                        // Attendre 2 secondes pour afficher le message puis déconnecter
                        setTimeout(() => {
                            signOut({ callbackUrl: '/login?reason=session_conflict' });
                        }, 2000);
                    }
                }
            } catch (error) {
                console.error('[SessionCheck] Error:', error);
            }
        };

        // Vérifier immédiatement
        checkSession();

        // Puis vérifier périodiquement
        const interval = setInterval(checkSession, intervalMs);

        return () => clearInterval(interval);
    }, [intervalMs]);

    return { sessionConflict };
}
