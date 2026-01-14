"use client";

import { useState, useEffect } from "react";
import { Store, Music, Play, Pause, Volume2, Zap, RefreshCw, Users } from "lucide-react";
import { clsx } from "clsx";
import styles from "./Dashboard.module.css";

interface StoreStatus {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    isPlaying: boolean;
    isAutoMode: boolean;
    volume: number;
    city: string | null;
    storeType: string | null;
    lastPlayedAt: string | null;
    group: {
        id: string;
        name: string;
        color: string;
    } | null;
    style: {
        id: string;
        name: string;
        icon: string | null;
        coverUrl: string | null;
    } | null;
}

interface LiveData {
    stats: {
        totalStores: number;
        activeStores: number;
        playingNow: number;
        autoModeCount: number;
    };
    stores: {
        playing: StoreStatus[];
        paused: StoreStatus[];
        inactive: StoreStatus[];
    };
    all: StoreStatus[];
}

export default function DashboardContent() {
    const [liveData, setLiveData] = useState<LiveData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchLiveData = async () => {
        try {
            const res = await fetch("/api/admin/live");
            if (!res.ok) {
                console.error("Failed to fetch live data:", res.status);
                return;
            }
            const data = await res.json();
            // Vérifier que les données sont valides
            if (data.stats && data.stores) {
                setLiveData(data);
                setLastUpdate(new Date());
            } else {
                console.error("Invalid live data format:", data);
            }
        } catch (error) {
            console.error("Failed to fetch live data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveData();
        // Auto refresh every 30 seconds
        const interval = setInterval(fetchLiveData, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (dateString: string | null) => {
        if (!dateString) return "Jamais";
        const date = new Date(dateString);
        return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spinner} size={32} />
                <p>Chargement des données en direct...</p>
            </div>
        );
    }

    if (!liveData) {
        return (
            <div className={styles.loadingContainer}>
                <p>Impossible de charger les données.</p>
                <button className={styles.refreshBtn} onClick={fetchLiveData}>
                    <RefreshCw size={18} />
                    Réessayer
                </button>
            </div>
        );
    }

    const { stats, stores } = liveData;

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <span className={styles.liveDot} />
                        Tableau de bord Live
                    </h1>
                    <p className={styles.subtitle}>
                        Dernière mise à jour: {lastUpdate.toLocaleTimeString("fr-FR")}
                    </p>
                </div>
                <button className={styles.refreshBtn} onClick={fetchLiveData}>
                    <RefreshCw size={18} />
                    Actualiser
                </button>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={clsx(styles.statCard, styles.primary)}>
                    <div className={styles.statIcon}>
                        <Store size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.totalStores}</span>
                        <span className={styles.statLabel}>Magasins total</span>
                    </div>
                </div>

                <div className={clsx(styles.statCard, styles.success)}>
                    <div className={styles.statIcon}>
                        <Play size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.playingNow}</span>
                        <span className={styles.statLabel}>En lecture</span>
                    </div>
                </div>

                <div className={clsx(styles.statCard, styles.warning)}>
                    <div className={styles.statIcon}>
                        <Pause size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.activeStores - stats.playingNow}</span>
                        <span className={styles.statLabel}>En pause</span>
                    </div>
                </div>

                <div className={clsx(styles.statCard, styles.info)}>
                    <div className={styles.statIcon}>
                        <Zap size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.autoModeCount}</span>
                        <span className={styles.statLabel}>Mode Auto</span>
                    </div>
                </div>
            </div>

            {/* Playing Now Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>
                        <Play size={20} className={styles.sectionIcon} />
                        En lecture maintenant ({stores.playing.length})
                    </h2>
                </div>

                {stores.playing.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Music size={32} />
                        <p>Aucun magasin n'est en lecture</p>
                    </div>
                ) : (
                    <div className={styles.storeGrid}>
                        {stores.playing.map((store) => (
                            <div key={store.id} className={clsx(styles.storeCard, styles.playing)}>
                                <div className={styles.storeHeader}>
                                    <div className={styles.storeInfo}>
                                        <span className={styles.storeName}>{store.name}</span>
                                        {store.group && (
                                            <span
                                                className={styles.groupBadge}
                                                style={{ background: store.group.color }}
                                            >
                                                {store.group.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.storeStatus}>
                                        <span className={styles.playingIndicator}>
                                            <span /><span /><span />
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.nowPlaying}>
                                    {store.style?.coverUrl ? (
                                        <img src={store.style.coverUrl} alt="" className={styles.coverThumb} />
                                    ) : (
                                        <div className={styles.coverPlaceholder}>
                                            {store.style?.icon || <Music size={16} />}
                                        </div>
                                    )}
                                    <div className={styles.trackInfo}>
                                        <span className={styles.styleName}>
                                            {store.style?.name || "Aucun style"}
                                        </span>
                                        <span className={styles.cityInfo}>
                                            {store.city || store.storeType || "—"}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.storeMeta}>
                                    <div className={styles.volumeInfo}>
                                        <Volume2 size={14} />
                                        <span>{store.volume}%</span>
                                    </div>
                                    {store.isAutoMode && (
                                        <span className={styles.autoBadge}>
                                            <Zap size={12} /> Auto
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Paused Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>
                        <Pause size={20} className={styles.sectionIcon} />
                        En pause ({stores.paused.length})
                    </h2>
                </div>

                {stores.paused.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>Aucun magasin en pause</p>
                    </div>
                ) : (
                    <div className={styles.storeList}>
                        {stores.paused.map((store) => (
                            <div key={store.id} className={clsx(styles.storeRow, styles.paused)}>
                                <div className={styles.storeRowInfo}>
                                    <span className={styles.storeName}>{store.name}</span>
                                    {store.group && (
                                        <span
                                            className={styles.groupBadge}
                                            style={{ background: store.group.color }}
                                        >
                                            {store.group.name}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.storeRowMeta}>
                                    <span className={styles.lastPlayed}>
                                        Dernière lecture: {formatTime(store.lastPlayedAt)}
                                    </span>
                                    <span className={styles.styleTag}>
                                        {store.style?.icon} {store.style?.name || "—"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Inactive Section */}
            {stores.inactive.length > 0 && (
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>
                            <Store size={20} className={styles.sectionIcon} />
                            Inactifs ({stores.inactive.length})
                        </h2>
                    </div>

                    <div className={styles.inactiveList}>
                        {stores.inactive.map((store) => (
                            <span key={store.id} className={styles.inactiveTag}>
                                {store.name}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
