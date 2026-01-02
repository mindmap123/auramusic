"use client";

import { useState, useEffect } from "react";
import styles from "./Activity.module.css";
import { Play, Pause, RefreshCw, Calendar, Filter } from "lucide-react";
import { clsx } from "clsx";

interface ActivityLog {
    id: string;
    storeId: string;
    action: string;
    details: any;
    createdAt: string;
    store: {
        id: string;
        name: string;
        email: string;
    };
}

interface Store {
    id: string;
    name: string;
}

export default function ActivityContent() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );

    useEffect(() => {
        fetchStores();
        fetchLogs();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [selectedStore, selectedDate]);

    const fetchStores = async () => {
        try {
            const res = await fetch("/api/admin/stores");
            const data = await res.json();
            setStores(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedStore) params.append("storeId", selectedStore);
            if (selectedDate) params.append("date", selectedDate);
            params.append("limit", "200");

            const res = await fetch(`/api/admin/activity?${params}`);
            const data = await res.json();
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case "PLAY":
                return <Play size={16} className={styles.iconPlay} />;
            case "PAUSE":
                return <Pause size={16} className={styles.iconPause} />;
            case "CHANGE_STYLE":
                return <RefreshCw size={16} className={styles.iconChange} />;
            default:
                return null;
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case "PLAY":
                return "Lecture";
            case "PAUSE":
                return "Pause";
            case "CHANGE_STYLE":
                return "Changement de style";
            default:
                return action;
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    // Group logs by store for stats
    const statsByStore = stores.map(store => {
        const storeLogs = logs.filter(l => l.storeId === store.id);
        const playCount = storeLogs.filter(l => l.action === "PLAY").length;
        const pauseCount = storeLogs.filter(l => l.action === "PAUSE").length;
        return { store, playCount, pauseCount, total: storeLogs.length };
    }).filter(s => s.total > 0);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Activité des magasins</h1>
                    <p className={styles.subtitle}>
                        Suivez l'utilisation de la radio par vos magasins
                    </p>
                </div>
            </div>

            {/* Stats cards */}
            <div className={styles.statsGrid}>
                {statsByStore.map(({ store, playCount, pauseCount, total }) => (
                    <div key={store.id} className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statName}>{store.name}</span>
                            <span className={styles.statTotal}>{total} actions</span>
                        </div>
                        <div className={styles.statDetails}>
                            <span className={styles.statPlay}>
                                <Play size={14} /> {playCount} lectures
                            </span>
                            <span className={styles.statPause}>
                                <Pause size={14} /> {pauseCount} pauses
                            </span>
                        </div>
                    </div>
                ))}
                {statsByStore.length === 0 && !loading && (
                    <div className={styles.noStats}>
                        Aucune activité pour cette date
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <Calendar size={18} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={styles.dateInput}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <Filter size={18} />
                    <select
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        className={styles.select}
                    >
                        <option value="">Tous les magasins</option>
                        {stores.map(store => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={fetchLogs} className={styles.refreshBtn}>
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Logs table */}
            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Heure</th>
                            <th>Magasin</th>
                            <th>Action</th>
                            <th>Détails</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className={styles.loading}>
                                    Chargement...
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className={styles.empty}>
                                    Aucune activité
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id}>
                                    <td className={styles.timeCell}>
                                        {formatTime(log.createdAt)}
                                    </td>
                                    <td>{log.store.name}</td>
                                    <td>
                                        <span className={clsx(styles.actionBadge, styles[`action${log.action}`])}>
                                            {getActionIcon(log.action)}
                                            {getActionLabel(log.action)}
                                        </span>
                                    </td>
                                    <td className={styles.detailsCell}>
                                        {log.details?.styleName && (
                                            <span>{log.details.styleName}</span>
                                        )}
                                        {log.details?.toStyleName && (
                                            <span>
                                                {log.details.fromStyleName} → {log.details.toStyleName}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
