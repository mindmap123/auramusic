"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.css";

interface LoginFormProps {
    isAdmin?: boolean;
}

export default function LoginForm({ isAdmin = false }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
            } else {
                router.push(isAdmin ? "/admin/dashboard" : "/dashboard");
            }
        } catch (err) {
            setError("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1 className="gradient-text">{isAdmin ? "Admin Login" : "Store Login"}</h1>
                <p className={styles.subtitle}>
                    Connectez-vous pour commencer à diffuser.
                </p>

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
                    {loading ? "Chargement..." : "Se connecter"}
                </button>
            </form>
        </div>
    );
}
