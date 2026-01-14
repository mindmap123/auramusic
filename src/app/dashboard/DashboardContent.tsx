"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Zap } from "lucide-react";
import { clsx } from "clsx";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useShallow } from "zustand/react/shallow";
import { initAudioContext } from "@/lib/audioManager";
import { AppLayout, Sidebar, PlayerBar, MobilePlayer } from "@/components/Layout";
import StyleGrid from "@/components/Player/StyleGrid";
import styles from "./Dashboard.module.css";

interface Style {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    colorTheme: string;
    mixUrl: string | null;
    coverUrl: string | null;
}

export default function DashboardContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState<"home" | "styles" | "favorites" | "settings">("home");
    const [favorites, setFavorites] = useState<string[]>([]);

    const {
        isPlaying,
        togglePlay,
        initPlayer,
        volume,
        setVolume,
        currentStyleId,
        setStyle,
        isAutoMode,
        setAutoMode,
        stop,
    } = usePlayerStore(useShallow((state) => ({
        isPlaying: state.isPlaying,
        togglePlay: state.togglePlay,
        initPlayer: state.initPlayer,
        volume: state.volume,
        setVolume: state.setVolume,
        currentStyleId: state.currentStyleId,
        setStyle: state.setStyle,
        isAutoMode: state.isAutoMode,
        setAutoMode: state.setAutoMode,
        stop: state.stop,
    })));

    const progress = usePlayerStore(state => state.progress);

    const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastPlayState = useRef<boolean | null>(null);

    // Auth check
    useEffect(() => {
        if (status === "loading") return;

        if (!session || (session.user as any)?.role !== "STORE") {
            router.replace("/login");
            return;
        }

        // Fetch store data
        fetch("/api/stores/me")
            .then((res) => res.json())
            .then(async (storeData) => {
                let currentPosition = 0;
                if (storeData?.currentStyleId) {
                    try {
                        const posRes = await fetch(
                            `/api/store/position?styleId=${storeData?.currentStyleId}`
                        );
                        const posData = await posRes.json();
                        currentPosition = posData.position || 0;
                    } catch (e) { }
                }
                setStore({ ...storeData, currentPosition });
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        // Fetch favorites
        fetch("/api/store/favorites")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setFavorites(data.map((s: any) => s.id));
                }
            })
            .catch(console.error);
    }, [session, status, router]);

    // Initialize player
    useEffect(() => {
        if (!store) return;

        if (store?.style?.mixUrl && store?.currentStyleId) {
            setStyle(store.currentStyleId, store.style.mixUrl);
            initPlayer(store.style.mixUrl, store.currentPosition || 0, (store.volume || 70) / 100);
        }
        if (store.isAutoMode) {
            setAutoMode(true);
        }
    }, [store?.id]);

    // Activity logging
    const logActivity = async (action: string, details?: any) => {
        try {
            await fetch("/api/store/activity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, details }),
            });
        } catch (err) {
            console.error("[Activity Log] Error:", err);
        }
    };

    // Activity logging
    useEffect(() => {
        if (lastPlayState.current !== null && lastPlayState.current !== isPlaying) {
            logActivity(isPlaying ? "PLAY" : "PAUSE", {
                styleId: currentStyleId || null,
                styleName: store?.style?.name || null,
            });
        }
        lastPlayState.current = isPlaying;
    }, [isPlaying, currentStyleId, store?.style?.name]);

    // Auto-mode check
    useEffect(() => {
        if (!isAutoMode || !currentStyleId) return;

        const checkProgram = async () => {
            try {
                const res = await fetch("/api/store/current-program");
                const data = await res.json();
                if (data.style && data.style.id !== currentStyleId) {
                    handleStyleChange(data.style);
                }
            } catch (err) {
                console.error("[Auto-Mode] Error:", err);
            }
        };

        checkProgram();
        const interval = setInterval(checkProgram, 30000);
        return () => clearInterval(interval);
    }, [isAutoMode, currentStyleId]);

    // Save position periodically
    const progressRef = useRef(progress);
    useEffect(() => {
        progressRef.current = progress;
    }, [progress]);

    useEffect(() => {
        if (!isPlaying) return;

        saveIntervalRef.current = setInterval(async () => {
            await fetch("/api/store/save-position", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ position: progressRef.current, isPlaying: true }),
            });
        }, 10000);

        return () => {
            if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
        };
    }, [isPlaying]);

    // Cleanup
    useEffect(() => {
        return () => stop();
    }, []);

    // Handlers
    const handleStyleChange = (style: Style) => {
        if (!style || !style.mixUrl) return;

        initAudioContext();
        stop();
        setStyle(style.id, style.mixUrl);
        setStore((prev: any) => ({
            ...prev,
            style,
            currentStyleId: style.id,
        }));
        initPlayer(style.mixUrl, 0, volume);
        togglePlay();

        fetch("/api/store/save-position", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position: progress, isPlaying: false }),
        }).catch(console.error);

        fetch("/api/store/change-style", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ styleId: style.id }),
        }).catch(console.error);

        logActivity("CHANGE_STYLE", {
            fromStyleId: currentStyleId || null,
            fromStyleName: store?.style?.name || null,
            toStyleId: style.id,
            toStyleName: style.name,
        });
    };

    const handleToggleFavorite = async (styleId: string) => {
        try {
            const res = await fetch("/api/store/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ styleId }),
            });
            const data = await res.json();
            if (data.isFavorite) {
                setFavorites((prev) => [...prev, styleId]);
            } else {
                setFavorites((prev) => prev.filter((id) => id !== styleId));
            }
        } catch (err) {
            console.error("[Favorites] Error:", err);
        }
    };

    const handleAutoModeToggle = async () => {
        const newVal = !isAutoMode;
        setAutoMode(newVal);
        await fetch("/api/stores/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isAutoMode: newVal }),
        });
    };

    const handleVolumeChange = async (newVolume: number) => {
        await fetch("/api/stores/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ volume: Math.round(newVolume * 100) }),
        });
    };

    // Loading state
    if (status === "loading" || loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
                <p>Chargement...</p>
            </div>
        );
    }

    if (!store) return null;

    // Filter styles for favorites view
    const filteredFavorites = favorites;

    return (
        <AppLayout
            accentColor={store.accentColor || "green"}
            sidebar={
                <Sidebar
                    storeName={store?.name || ""}
                    currentView={currentView}
                    onViewChange={setCurrentView}
                />
            }
            playerBar={
                <PlayerBar
                    currentStyle={store.style}
                    onVolumeChange={handleVolumeChange}
                />
            }
        >
            {/* Main Content */}
            <div className={styles.content}>
                {/* Header Section */}
                <header className={styles.header}>
                    <div className={styles.headerActions}>
                        <button
                            className={clsx(
                                styles.autoModeBtn,
                                isAutoMode && styles.active
                            )}
                            onClick={handleAutoModeToggle}
                        >
                            <Zap size={16} fill={isAutoMode ? "currentColor" : "none"} />
                            <span>{isAutoMode ? "Auto ON" : "Auto OFF"}</span>
                        </button>
                    </div>
                    <div className={styles.greeting}>
                        <h1>
                            {currentView === "home" && `Bonjour ${store.name}`}
                            {currentView === "styles" && "Tous les styles"}
                            {currentView === "favorites" && "Vos favoris"}
                            {currentView === "settings" && "Paramètres"}
                        </h1>
                    </div>
                    <div className={styles.headerSpacer} />
                </header>

                {/* Content based on view */}
                {currentView === "home" && (
                    <>
                        {/* Currently Playing Hero */}
                        {store.style && (
                            <section className={styles.heroSection}>
                                <div className={styles.heroBg}>
                                    {store.style.coverUrl && (
                                        <img src={store.style.coverUrl} alt="" />
                                    )}
                                    <div className={styles.heroOverlay} />
                                </div>
                                <div className={styles.heroContent}>
                                    <span className={styles.heroLabel}>EN LECTURE</span>
                                    <h2 className={styles.heroTitle}>{store.style.name}</h2>
                                    <p className={styles.heroDesc}>{store.style.description}</p>
                                </div>
                            </section>
                        )}

                        {/* Quick Picks */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2>Ambiances disponibles</h2>
                            </div>
                            <StyleGrid
                                activeStyleId={currentStyleId}
                                onSelect={handleStyleChange}
                                favorites={favorites}
                                onToggleFavorite={handleToggleFavorite}
                                isPlaying={isPlaying}
                            />
                        </section>
                    </>
                )}

                {currentView === "styles" && (
                    <section className={styles.section}>
                        <StyleGrid
                            activeStyleId={currentStyleId}
                            onSelect={handleStyleChange}
                            favorites={favorites}
                            onToggleFavorite={handleToggleFavorite}
                            isPlaying={isPlaying}
                        />
                    </section>
                )}

                {currentView === "favorites" && (
                    <section className={styles.section}>
                        {favorites.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>Aucun favori pour le moment</p>
                                <span>Cliquez sur le coeur d'une ambiance pour l'ajouter</span>
                            </div>
                        ) : (
                            <StyleGrid
                                activeStyleId={currentStyleId}
                                onSelect={handleStyleChange}
                                favorites={favorites}
                                onToggleFavorite={handleToggleFavorite}
                                isPlaying={isPlaying}
                            />
                        )}
                    </section>
                )}

                {currentView === "settings" && (
                    <section className={styles.section}>
                        <div className={styles.settingsCard}>
                            <h3>Personnalisation</h3>
                            <p>Choisissez la couleur d'accent de votre interface</p>
                            <div className={styles.colorPicker}>
                                {["green", "violet", "blue", "orange", "pink", "red", "cyan"].map(
                                    (color) => (
                                        <button
                                            key={color}
                                            className={clsx(
                                                styles.colorOption,
                                                store.accentColor === color && styles.selected
                                            )}
                                            data-color={color}
                                            onClick={async () => {
                                                setStore((prev: any) => ({
                                                    ...prev,
                                                    accentColor: color,
                                                }));
                                                await fetch("/api/stores/me", {
                                                    method: "PATCH",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ accentColor: color }),
                                                });
                                            }}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Mobile Player */}
            <MobilePlayer
                currentStyle={store.style}
                onVolumeChange={handleVolumeChange}
            />
        </AppLayout>
    );
}
