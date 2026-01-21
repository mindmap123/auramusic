"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Store,
    Music,
    Play,
    Plus,
    Calendar,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Clock,
    Zap,
    ChevronRight,
    Volume2,
} from "lucide-react";
import { clsx } from "clsx";
import styles from "./Dashboard.module.css";

interface StoreStatus {
    id: string;
    name: string;
    isPlaying: boolean;
    isAutoMode: boolean;
    volume: number;
    city: string | null;
    group: { name: string; color: string } | null;
    style: { id: string; name: string; icon: string | null; coverUrl: string | null } | null;
}

interface PopularStyle {
    id: string;
    name: string;
    coverUrl: string | null;
    icon: string | null;
    hours: number;
}

interface DashboardData {
    stats: {
        activeStores: number;
        activeStoresDiff: number;
        playingNow: number;
        todayHours: number;
        hoursDiff: number;
        autoModeCount: number;
    };
    stores: {
        playing: StoreStatus[];
    };
    popularStyles: PopularStyle[];
}

const quickActions = [
    { label: "Ajouter magasin", icon: Store, href: "/admin/stores", color: "blue" },
    { label: "Nouveau style", icon: Music, href: "/admin/tracks", color: "purple" },
    { label: "Programmer", icon: Calendar, href: "/admin/scheduling", color: "green" },
];

export default function DashboardContent() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchData = async () => {
        try {
            const res = await fetch("/api/admin/live");
            if (res.ok) {
                const json = await res.json();
                setData(json);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spinner} size={32} />
                <p>Chargement du tableau de bord...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className={styles.loadingContainer}>
                <p>Impossible de charger les données.</p>
                <button className={styles.refreshBtn} onClick={fetchData}>
                    <RefreshCw size={18} />
                    Réessayer
                </button>
            </div>
        );
    }

    const { stats, stores, popularStyles } = data;

    const renderDiff = (diff: number, suffix: string = "") => {
        if (diff === 0) return null;
        const isPositive = diff > 0;
        return (
            <span className={clsx(styles.diff, isPositive ? styles.positive : styles.negative)}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? "+" : ""}{diff}{suffix}
            </span>
        );
    };

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Tableau de Bord</h1>
                    <p className={styles.subtitle}>
                        Mis à jour à {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                </div>
                <button className={styles.refreshBtn} onClick={fetchData}>
                    <RefreshCw size={18} />
                    Actualiser
                </button>
            </div>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={clsx(styles.kpiIcon, styles.blue)}>
                        <Store size={22} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiValue}>{stats.activeStores}</span>
                        <span className={styles.kpiLabel}>Magasins Actifs</span>
                        {renderDiff(stats.activeStoresDiff, " vs hier")}
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={clsx(styles.kpiIcon, styles.green)}>
                        <Play size={22} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiValue}>{stats.playingNow}</span>
                        <span className={styles.kpiLabel}>En Lecture</span>
                        <span className={styles.liveBadge}>
                            <span className={styles.liveDot} />
                            Live
                        </span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={clsx(styles.kpiIcon, styles.purple)}>
                        <Clock size={22} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiValue}>{stats.todayHours}h</span>
                        <span className={styles.kpiLabel}>Heures Streamées</span>
                        {renderDiff(stats.hoursDiff, "h")}
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={clsx(styles.kpiIcon, styles.orange)}>
                        <Zap size={22} />
                    </div>
                    <div className={styles.kpiContent}>
                        <span className={styles.kpiValue}>{stats.autoModeCount}</span>
                        <span className={styles.kpiLabel}>Mode Auto</span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Actions + Playing Now */}
            <div className={styles.middleGrid}>
                {/* Quick Actions */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Actions Rapides</h2>
                    </div>
                    <div className={styles.actionsGrid}>
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className={clsx(styles.actionBtn, styles[action.color])}
                            >
                                <action.icon size={20} />
                                <span>{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Playing Now */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>
                            <span className={styles.liveDot} />
                            En Lecture
                        </h2>
                        <Link href="/admin/stores" className={styles.viewAll}>
                            Voir tout <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className={styles.playingList}>
                        {stores.playing.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Music size={24} />
                                <p>Aucun magasin en lecture</p>
                            </div>
                        ) : (
                            stores.playing.map((store) => (
                                <div key={store.id} className={styles.playingItem}>
                                    <div className={styles.playingCover}>
                                        {store.style?.coverUrl ? (
                                            <img src={store.style.coverUrl} alt="" />
                                        ) : (
                                            <div className={styles.coverPlaceholder}>
                                                {store.style?.icon || <Music size={16} />}
                                            </div>
                                        )}
                                        <span className={styles.playingBars}>
                                            <span /><span /><span />
                                        </span>
                                    </div>
                                    <div className={styles.playingInfo}>
                                        <span className={styles.playingStyle}>
                                            {store.style?.name || "—"}
                                        </span>
                                        <span className={styles.playingStore}>
                                            {store.name}
                                            {store.city && <span> • {store.city}</span>}
                                        </span>
                                    </div>
                                    <div className={styles.playingMeta}>
                                        <Volume2 size={14} />
                                        <span>{store.volume}%</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Popular Styles */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Styles Populaires</h2>
                    <Link href="/admin/tracks" className={styles.viewAll}>
                        Voir tout <ChevronRight size={16} />
                    </Link>
                </div>
                <div className={styles.stylesGrid}>
                    {popularStyles.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Music size={24} />
                            <p>Aucune donnée cette semaine</p>
                        </div>
                    ) : (
                        popularStyles.map((style) => (
                            <div key={style.id} className={styles.styleCard}>
                                <div className={styles.styleCover}>
                                    {style.coverUrl ? (
                                        <img src={style.coverUrl} alt={style.name} />
                                    ) : (
                                        <div className={styles.stylePlaceholder}>
                                            {style.icon || <Music size={24} />}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.styleInfo}>
                                    <span className={styles.styleName}>{style.name}</span>
                                    <span className={styles.styleHours}>{style.hours}h cette semaine</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
