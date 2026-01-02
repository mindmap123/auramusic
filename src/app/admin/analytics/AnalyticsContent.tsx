"use client";

import { useState, useEffect } from "react";
import styles from "./Analytics.module.css";
import { Clock, Store, Music, Trophy } from "lucide-react";

interface StoreStat {
    name: string;
    totalHours: string;
    favoriteStyle: string;
    sessionsCount: number;
}

export default function AnalyticsContent() {
    const [stats, setStats] = useState<StoreStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/analytics")
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className={styles.container}><p>Chargement...</p></div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Statistiques d'Écoute</h1>
                <p className={styles.subtitle}>Analyse de l'utilisation de la plateforme par magasin.</p>
            </header>

            <div className={styles.grid}>
                {stats.length === 0 ? (
                    <p>Aucune donnée disponible.</p>
                ) : stats.map((store) => (
                    <div key={store.name} className={styles.card}>
                        <div className={styles.storeHeader}>
                            <Store size={20} className={styles.icon} />
                            <h3>{store.name}</h3>
                        </div>

                        <div className={styles.metrics}>
                            <div className={styles.metric}>
                                <Clock size={16} />
                                <span>{store.totalHours}h écoutées</span>
                            </div>
                            <div className={styles.metric}>
                                <Trophy size={16} />
                                <span>Style favori : <strong>{store.favoriteStyle}</strong></span>
                            </div>
                            <div className={styles.metric}>
                                <Music size={16} />
                                <span>{store.sessionsCount} sessions</span>
                            </div>
                        </div>

                        <div className={styles.progressContainer}>
                            <div className={styles.progressBar} style={{ width: `${Math.min(parseFloat(store.totalHours) * 10, 100)}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
