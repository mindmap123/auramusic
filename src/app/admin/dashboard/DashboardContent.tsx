"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Store,
    Music,
    Headphones,
    Clock,
    Plus,
    Calendar,
    TrendingUp,
    RefreshCw,
    ChevronRight,
    Play,
    Radio,
} from "lucide-react";
import { clsx } from "clsx";
import styles from "./Dashboard.module.css";

interface StyleInfo {
    id: string;
    name: string;
    icon: string | null;
    coverUrl: string | null;
}

interface PopularStyle {
    id: string;
    name: string;
    coverUrl: string | null;
    icon: string | null;
    duration: number;
    durationFormatted: string;
}

interface ActiveStore {
    id: string;
    name: string;
    isPlaying: boolean;
    group: { name: string; color: string } | null;
    style: StyleInfo | null;
}

interface FeaturedLive {
    style: StyleInfo;
    storeCount: number;
    listeners: number;
}

interface DashboardData {
    stats: {
        activeStores: number;
        activeStoresDiff: number;
        playingNow: number;
        playingDiff: number;
        totalStyles: number;
        stylesDiff: number;
        totalHours: string;
        hoursDiffPercent: number;
    };
    featuredLive: FeaturedLive | null;
    popularStyles: PopularStyle[];
    activeStores: ActiveStore[];
}

const quickActions = [
    {
        label: "Ajouter un magasin",
        description: "Nouveau point de diffusion",
        icon: Store,
        href: "/admin/stores",
        color: "blue",
    },
    {
        label: "Créer une playlist",
        description: "Nouvelle ambiance",
        icon: Music,
        href: "/admin/tracks",
        color: "pink",
    },
    {
        label: "Programmer",
        description: "Automatiser la diffusion",
        icon: Calendar,
        href: "/admin/scheduling",
        color: "green",
    },
];

export default function DashboardContent() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/admin/live");
            if (res.ok) {
                const json = await res.json();
                setData(json);
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
                <button className={styles.retryBtn} onClick={fetchData}>
                    <RefreshCw size={18} />
                    Réessayer
                </button>
            </div>
        );
    }

    const { stats, featuredLive, popularStyles, activeStores } = data;

    const renderDiff = (value: number, suffix: string = "") => {
        if (value === 0) return null;
        return (
            <span className={styles.diff}>
                <TrendingUp size={14} />
                +{value}{suffix}
            </span>
        );
    };

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <p className={styles.welcome}>Bienvenue</p>
                    <h1 className={styles.title}>Tableau de Bord</h1>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/admin/tracks" className={styles.headerBtnOutline}>
                        Ajouter des pistes
                    </Link>
                    <Link href="/admin/stores" className={styles.headerBtnPrimary}>
                        <Play size={16} />
                        Lecture
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={clsx(styles.kpiIcon, styles.blue)}>
                        <Store size={20} />
                    </div>
                    <div className={styles.kpiValue}>{stats.activeStores}</div>
                    <div className={styles.kpiFooter}>
                        <span className={styles.kpiLabel}>Magasins Actifs</span>
                        {renderDiff(stats.activeStoresDiff)}
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={clsx(styles.kpiIcon, styles.pink)}>
                        <Headphones size={20} />
                    </div>
                    <div className={styles.kpiValue}>{stats.playingNow}</div>
                    <div className={styles.kpiFooter}>
                        <span className={styles.kpiLabel}>En Écoute</span>
                        {renderDiff(stats.playingDiff)}
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={clsx(styles.kpiIcon, styles.purple)}>
                        <Music size={20} />
                    </div>
                    <div className={styles.kpiValue}>{stats.totalStyles}</div>
                    <div className={styles.kpiFooter}>
                        <span className={styles.kpiLabel}>Playlists</span>
                        {renderDiff(stats.stylesDiff)}
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={clsx(styles.kpiIcon, styles.orange)}>
                        <Clock size={20} />
                    </div>
                    <div className={styles.kpiValue}>{stats.totalHours}</div>
                    <div className={styles.kpiFooter}>
                        <span className={styles.kpiLabel}>Heures Streamées</span>
                        {stats.hoursDiffPercent > 0 && (
                            <span className={styles.diff}>
                                <TrendingUp size={14} />
                                +{stats.hoursDiffPercent}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainGrid}>
                {/* Featured Live */}
                <div className={styles.featuredCard}>
                    {featuredLive ? (
                        <>
                            <div className={styles.featuredCover}>
                                {featuredLive.style.coverUrl ? (
                                    <img src={featuredLive.style.coverUrl} alt="" />
                                ) : (
                                    <div className={styles.featuredPlaceholder}>
                                        <Radio size={48} />
                                    </div>
                                )}
                            </div>
                            <div className={styles.featuredInfo}>
                                <span className={styles.liveBadge}>EN DIRECT</span>
                                <h2 className={styles.featuredTitle}>{featuredLive.style.name}</h2>
                                <p className={styles.featuredMeta}>
                                    Diffusé sur {featuredLive.storeCount} magasin{featuredLive.storeCount > 1 ? "s" : ""} • {featuredLive.listeners} auditeurs
                                </p>
                                <div className={styles.featuredActions}>
                                    <button className={styles.listenBtn}>
                                        <Headphones size={18} />
                                        Écouter
                                    </button>
                                    <Link href="/admin/tracks" className={styles.playlistBtn}>
                                        Voir la playlist
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.noLive}>
                            <Radio size={48} />
                            <h3>Aucune diffusion en cours</h3>
                            <p>Démarrez la lecture sur un magasin</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className={styles.actionsCard}>
                    <h2 className={styles.cardTitle}>Actions Rapides</h2>
                    <div className={styles.actionsList}>
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className={styles.actionItem}
                            >
                                <div className={clsx(styles.actionIcon, styles[action.color])}>
                                    <action.icon size={20} />
                                </div>
                                <div className={styles.actionText}>
                                    <span className={styles.actionLabel}>{action.label}</span>
                                    <span className={styles.actionDesc}>{action.description}</span>
                                </div>
                                <ChevronRight size={20} className={styles.actionArrow} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className={styles.bottomGrid}>
                {/* Popular Playlists */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Playlists Populaires</h2>
                        <Link href="/admin/tracks" className={styles.viewAll}>
                            Voir tout
                        </Link>
                    </div>
                    <div className={styles.playlistList}>
                        {popularStyles.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Music size={24} />
                                <p>Aucune playlist</p>
                            </div>
                        ) : (
                            popularStyles.map((style, index) => (
                                <div key={style.id} className={styles.playlistItem}>
                                    <div className={clsx(
                                        styles.playlistIcon,
                                        index === 0 ? styles.pink :
                                        index === 1 ? styles.orange :
                                        index === 2 ? styles.purple : styles.blue
                                    )}>
                                        <Music size={18} />
                                    </div>
                                    <div className={styles.playlistInfo}>
                                        <span className={styles.playlistName}>{style.name}</span>
                                        <span className={styles.playlistMeta}>
                                            {style.durationFormatted}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Active Stores */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Magasins Actifs</h2>
                        <Link href="/admin/stores" className={styles.viewAll}>
                            Voir tout
                        </Link>
                    </div>
                    <div className={styles.storesList}>
                        {activeStores.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Store size={24} />
                                <p>Aucun magasin actif</p>
                            </div>
                        ) : (
                            activeStores.map((store) => (
                                <div key={store.id} className={styles.storeItem}>
                                    <div className={styles.storeIcon}>
                                        <Store size={18} />
                                    </div>
                                    <div className={styles.storeInfo}>
                                        <span className={styles.storeName}>{store.name}</span>
                                        <span className={styles.storeMeta}>
                                            {store.group?.name || "—"} • {store.style?.name || "—"}
                                        </span>
                                    </div>
                                    <div className={clsx(
                                        styles.statusDot,
                                        store.isPlaying ? styles.playing : styles.paused
                                    )} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
