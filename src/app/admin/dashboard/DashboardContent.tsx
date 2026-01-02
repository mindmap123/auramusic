"use client";

import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import { Store, Music, ListMusic, TrendingUp } from "lucide-react";

interface Stats {
    stores: number;
    stylesCount: number;
    stylesWithMix: number;
    sessions: number;
}

export default function DashboardContent() {
    const [stats, setStats] = useState<Stats>({ stores: 0, stylesCount: 0, stylesWithMix: 0, sessions: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        { name: "Magasins actifs", value: stats.stores, icon: Store, color: "#3b82f6" },
        { name: "Mix configurés", value: `${stats.stylesWithMix}/${stats.stylesCount}`, icon: Music, color: "#8b5cf6" },
        { name: "Styles musicaux", value: stats.stylesCount, icon: ListMusic, color: "#ec4899" },
        { name: "Total Sessions", value: stats.sessions, icon: TrendingUp, color: "#10b981" },
    ];

    return (
        <div>
            <h1 className={styles.title}>Vue d'ensemble</h1>

            <div className={styles.grid}>
                {cards.map((card) => (
                    <div key={card.name} className={styles.card}>
                        <div className={styles.cardIcon} style={{ background: card.color }}>
                            <card.icon size={24} color="white" />
                        </div>
                        <div className={styles.cardInfo}>
                            <span className={styles.cardLabel}>{card.name}</span>
                            <span className={styles.cardValue}>{loading ? "..." : card.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.section}>
                <h2>Dernières activités</h2>
                <div className={styles.tableWrapper}>
                    <p className={styles.placeholder}>Consultez les statistiques détaillées dans l'onglet dédié.</p>
                </div>
            </div>
        </div>
    );
}
