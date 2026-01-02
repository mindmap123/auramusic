"use client";

import { useEffect, useState, useRef } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Play, Pause, Music, Zap, Minimize2, Maximize2 } from "lucide-react";
import styles from "./Player.module.css";
import StyleSelector from "./StyleSelector";
import VolumeControl from "./VolumeControl";
import AudioVisualizer from "./AudioVisualizer";
import { clsx } from "clsx";

interface PlayerProps {
    store: any;
    isPreview?: boolean;
}

export default function Player({ store, isPreview = false }: PlayerProps) {
    const {
        isPlaying,
        togglePlay,
        initPlayer,
        volume,
        currentStyleId,
        setStyle,
        isAutoMode,
        setAutoMode,
        stop,
        progress,
        mixUrl
    } = usePlayerStore();

    const [localStore, setLocalStore] = useState(store);
    const [isMiniMode, setIsMiniMode] = useState(false);
    const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Load
    useEffect(() => {
        if (store.style?.mixUrl) {
            setStyle(store.currentStyleId, store.style.mixUrl);
            initPlayer(store.style.mixUrl, store.currentPosition, store.volume / 100);
        }
        if (store.isAutoMode) {
            setAutoMode(true);
        }
    }, []);

    // Auto-Mode Sync
    useEffect(() => {
        if (!isAutoMode) return;

        const checkProgram = async () => {
            try {
                const res = await fetch("/api/store/current-program");
                const data = await res.json();
                if (data.style && data.style.id !== currentStyleId) {
                    handleStyleChange(data.style.slug);
                }
            } catch (err) {
                console.error("[Auto-Mode] Sync error:", err);
            }
        };

        checkProgram();
        const programInterval = setInterval(checkProgram, 30000);
        return () => clearInterval(programInterval);
    }, [isAutoMode, currentStyleId]);

    // Auto-Save Effect
    useEffect(() => {
        saveIntervalRef.current = setInterval(async () => {
            if (isPlaying) {
                await fetch("/api/store/save-position", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ position: progress, isPlaying: true })
                });
            }
        }, 10000);

        return () => {
            if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
        };
    }, [isPlaying, progress]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stop();
        };
    }, []);

    const handleStyleChange = async (styleSlug: string) => {
        stop();

        await fetch("/api/store/save-position", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position: progress, isPlaying: false })
        });

        const res = await fetch("/api/styles");
        const stylesData = await res.json();
        const style = stylesData.find((s: any) => s.slug === styleSlug);

        if (style && style.mixUrl) {
            setStyle(style.id, style.mixUrl);

            const updateRes = await fetch("/api/store/change-style", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ styleId: style.id })
            });
            const updatedStore = await updateRes.json();
            setLocalStore(updatedStore);

            initPlayer(style.mixUrl, updatedStore.currentPosition, volume);
            togglePlay();
        }
    };

    const handleAutoModeToggle = async () => {
        const newVal = !isAutoMode;
        setAutoMode(newVal);
        await fetch("/api/stores/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isAutoMode: newVal })
        });
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs > 0 ? hrs + ":" : ""}${mins < 10 && hrs > 0 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const currentProgress = usePlayerStore(state => state.progress);

    // Mini Player Mode
    if (isMiniMode && !isPreview) {
        return (
            <div className={styles.miniContainer}>
                <div className={styles.miniPlayer}>
                    <div className={clsx(styles.miniCover, isPlaying && styles.playing)}>
                        {localStore.style?.coverUrl ? (
                            <img src={localStore.style.coverUrl} alt={localStore.style.name} />
                        ) : isPlaying ? (
                            <AudioVisualizer size="small" />
                        ) : (
                            <Music size={24} color="var(--muted-foreground)" />
                        )}
                    </div>
                    <div className={styles.miniInfo}>
                        <div className={styles.miniTitle}>
                            {localStore.style?.name || "Aucune ambiance"}
                        </div>
                        <div className={styles.miniStyle}>
                            {formatTime(currentProgress)} / 1:00:00
                        </div>
                    </div>
                    <div className={styles.miniControls}>
                        <button
                            onClick={togglePlay}
                            className={styles.miniPlayBtn}
                            disabled={!mixUrl}
                        >
                            {isPlaying ? (
                                <Pause size={20} fill="white" color="white" />
                            ) : (
                                <Play size={20} fill="white" color="white" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsMiniMode(false)}
                            className={styles.miniExpandBtn}
                            title="Agrandir"
                        >
                            <Maximize2 size={18} />
                        </button>
                    </div>
                </div>
                <div className={styles.miniVolume}>
                    <VolumeControl compact />
                </div>
            </div>
        );
    }

    // Full Player Mode
    return (
        <div className={clsx(styles.container, isPreview && styles.previewContainer)}>
            <div className={styles.mainGrid}>
                <section className={styles.playerSection}>
                    {!isPreview && (
                        <button
                            onClick={() => setIsMiniMode(true)}
                            className={styles.miniToggle}
                            title="Mode mini"
                        >
                            <Minimize2 size={18} />
                        </button>
                    )}

                    <div className={styles.trackInfo}>
                        <div className={clsx(styles.coverArt, isPlaying && styles.playing)}>
                            {localStore.style?.coverUrl ? (
                                <img src={localStore.style.coverUrl} alt={localStore.style.name} className={styles.coverImage} />
                            ) : isPlaying ? (
                                <AudioVisualizer />
                            ) : (
                                <Music size={64} color="var(--muted-foreground)" />
                            )}
                        </div>
                        <div className={styles.titles}>
                            <h1 className={styles.trackTitle}>Mix Continu</h1>
                            <p className={styles.styleName}>
                                {localStore.style?.name || "Aucune ambiance sélectionnée"}
                            </p>
                            <div className={styles.timeInfo}>
                                {formatTime(currentProgress)} / 1:00:00
                            </div>
                        </div>
                    </div>

                    <div className={styles.controls}>
                        <button
                            onClick={togglePlay}
                            className={clsx(styles.playButton, !mixUrl && styles.disabled)}
                            disabled={!mixUrl}
                        >
                            {isPlaying ? (
                                <Pause size={40} fill="white" color="white" />
                            ) : (
                                <Play size={40} fill="white" color="white" />
                            )}
                        </button>
                    </div>

                    <div className={styles.volumeWrapper}>
                        <VolumeControl />
                    </div>
                </section>

                <section className={styles.styleSection}>
                    <header className={styles.styleHeader}>
                        <div className={styles.styleHeaderText}>
                            <h2>Ambiances</h2>
                            <p>Choisissez l'atmosphère de votre espace</p>
                        </div>
                        <button
                            className={clsx(styles.autoModeBtn, isAutoMode && styles.autoActive)}
                            onClick={handleAutoModeToggle}
                        >
                            <Zap size={14} fill={isAutoMode ? "currentColor" : "none"} />
                            <span>{isAutoMode ? "Auto" : "Manuel"}</span>
                        </button>
                    </header>
                    <StyleSelector
                        activeStyle={localStore.style?.slug}
                        onSelect={handleStyleChange}
                    />
                </section>
            </div>
        </div>
    );
}
