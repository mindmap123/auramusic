import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { validateStoreSession } from "./sessionManager";

/**
 * Middleware pour vérifier la session store
 * Retourne une erreur 401 si la session est invalide (compte utilisé ailleurs)
 */
export async function validateStoreSessionMiddleware() {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
        return {
            valid: false,
            response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }
    
    const user = session.user as any;
    
    // Vérifier uniquement pour les stores (pas les admins/users)
    if (user.role === "STORE") {
        const storeId = user.id;
        const sessionToken = user.sessionToken;
        
        if (!sessionToken) {
            return {
                valid: false,
                response: NextResponse.json({ 
                    error: "Session invalide",
                    code: "INVALID_SESSION"
                }, { status: 401 }),
            };
        }
        
        const isValid = await validateStoreSession(storeId, sessionToken);
        
        if (!isValid) {
            return {
                valid: false,
                response: NextResponse.json({ 
                    error: "Votre compte est utilisé sur un autre appareil",
                    code: "SESSION_CONFLICT"
                }, { status: 401 }),
            };
        }
    }
    
    return {
        valid: true,
        session,
        user,
    };
}
