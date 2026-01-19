"use client";

import { useState, useEffect } from "react";
import { AppLayout, Sidebar, PlayerBar } from "@/components/Layout";
import StyleGrid from "@/components/Player/StyleGrid";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useShallow } from "zustand/react/shallow";
import { Monitor, RefreshCcw } from "lucide-react";
import styles from "./Preview.module.css";
import dashboardStyles from "@/app/dashboard/Dashboard.module.css";

export default function PreviewContent() {
    const [stores, setStores] = useState<any[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string>("");
    const [previewStore, setPreviewStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Preview state simulation
    const [currentView, setCurrentView] = useState<"home" | "styles" | "favorites" | "settings">("home");

    const {
        isPlaying,
        currentStyleId,
        setStyle,
        stop,
    } = usePlayerStore(useShallow((state) => ({
        isPlaying: state.isPlaying,
        currentStyleId: state.currentStyleId,
        setStyle: state.setStyle,
        stop: state.stop,
    })));

    useEffect(() => { fetchStores(); }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => stop();
    }, []);

    const fetchStores = async () => {
        try {
            const res = await fetch("/api/admin/stores");
            const data = await res.json();
            setStores(data);
            if (data.length > 0) {
                setSelectedStoreId(data[0].id);
                loadPreview(data[0].id);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const loadPreview = async (storeId: string) => {
        setRefreshing(true);
        try {
            const res = await fetch(`/api/admin/preview/store?storeId=${storeId}`);
            const data = await res.json();
            setPreviewStore(data);

            // Init player state if needed
            if (data.style?.mixUrl) {
                setStyle(data.currentStyleId || data.style.id, data.style.mixUrl);
            }
        } catch (err) { console.error(err); }
        finally { setRefreshing(false); setLoading(false); }
    };

    if (loading) return <div className={styles.loading}>Chargement...</div>;

    if (stores.length === 0) {
        return (
            <div className={styles.empty}>
                <Monitor size={48} />
                <h2>Aucun magasin</h2>
                <p>Créez d'abord un magasin.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.info}>
                    <h1 className={styles.title}>Aperçu Magasin</h1>
                    <p className={styles.subtitle}>Interface client telle qu'elle apparaît en magasin</p>
                </div>
                <div className={styles.actions}>
                    <select value={selectedStoreId} onChange={(e) => { setSelectedStoreId(e.target.value); loadPreview(e.target.value); }} className={styles.storeSelect}>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button onClick={() => loadPreview(selectedStoreId)} className={styles.refreshBtn} disabled={refreshing}>
                        <RefreshCcw size={18} className={refreshing ? styles.spin : ""} /><span>Actualiser</span>
                    </button>
                </div>
            </header>

            <div className={styles.previewFrame}>
                {previewStore && (
                    <div className={styles.deviceContainer}>
                        <AppLayout
                            accentColor={previewStore.accentColor || "green"}
                            sidebar={
                                <Sidebar
                                    storeName={previewStore.name}
                                    currentView={currentView}
                                    onViewChange={setCurrentView}
                                />
                            }
                            playerBar={
                                <PlayerBar
                                    currentStyle={previewStore.style}
                                    onVolumeChange={() => { }}
                                />
                            }
                        >
                            <div className={dashboardStyles.content}>
                                <header className={dashboardStyles.header}>
                                    <div className={dashboardStyles.greeting}>
                                        <h1>
                                            {currentView === "home" && `Bonjour ${previewStore.name}`}
                                            {currentView === "styles" && "Tous les styles"}
                                        </h1>
                                    </div>
                                </header>

                                {currentView === "home" && previewStore.style && (
                                    <section className={dashboardStyles.heroSection}>
                                        <div className={dashboardStyles.heroBg}>
                                            {previewStore.style.coverUrl && <img src={previewStore.style.coverUrl} alt="" />}
                                            <div className={dashboardStyles.heroOverlay} />
                                        </div>
                                        <div className={dashboardStyles.heroContent}>
                                            <span className={dashboardStyles.heroLabel}>EN LECTURE</span>
                                            <h2 className={dashboardStyles.heroTitle}>{previewStore.style.name}</h2>
                                            <p className={dashboardStyles.heroDesc}>{previewStore.style.description}</p>
                                        </div>
                                    </section>
                                )}

                                <section className={dashboardStyles.section}>
                                    <div className={dashboardStyles.sectionHeader}>
                                        <h2>Ambiances</h2>
                                    </div>
                                    <StyleGrid
                                        activeStyleId={currentStyleId}
                                        onSelect={() => { }} // Read only in preview
                                        isPlaying={isPlaying}
                                    />
                                </section>
                            </div>
                        </AppLayout>
                    </div>
                )}
            </div>
        </div>
    );
}
