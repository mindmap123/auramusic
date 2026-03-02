"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Vérifier si déconnecté pour conflit de session
    const sessionConflict = searchParams.get('reason') === 'session_conflict';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Identifiants invalides");
                setLoading(false);
                return;
            }

            // Get session to check role and redirect accordingly
            const session = await getSession();
            if (session?.user) {
                const role = (session.user as any).role;
                if (role === "ADMIN") {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/dashboard");
                }
                router.refresh();
            }
        } catch (err) {
            setError("Une erreur est survenue");
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1 className="gradient-text">Connexion</h1>
                <p className={styles.subtitle}>
                    Connectez-vous pour commencer à diffuser.
                </p>

                {sessionConflict && (
                    <div className={styles.warning}>
                        <AlertTriangle size={20} />
                        <div>
                            <strong>Compte utilisé ailleurs</strong>
                            <p>Votre compte a été utilisé sur un autre appareil. Reconnectez-vous pour continuer.</p>
                        </div>
                    </div>
                )}

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.inputGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="email@aura.com"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? "Connexion..." : "Se connecter"}
                </button>
            </form>
        </div>
    );
}
