"use client";

import { useEffect, useState, useRef } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Play, Pause, Music, Zap, SkipBack, SkipForward, ChevronDown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import styles from "./Player.module.css";
import StyleSelector from "./StyleSelector";
import VolumeKnob from "./VolumeKnob";
import AudioVisualizer from "./AudioVisualizer";
import { clsx } from "clsx";
import { initAudioContext } from "@/lib/audioManager";

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
        setStyle,
        isAutoMode,
        setAutoMode,
        stop,
        progress,
        mixUrl,
        seekRelative
    } = usePlayerStore();

    // Fix hydration issue
    const currentStyleId = usePlayerStore((state) => state.currentStyleId) ?? null;

    const [localStore, setLocalStore] = useState(store);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isMobileFullScreen, setIsMobileFullScreen] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);

    // Activity & Save Logic
    const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastPlayState = useRef<boolean | null>(null);

    // --- Effects (Logic unchanged from original) ---

    useEffect(() => {
        const checkResponsive = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 640);
            setIsTablet(width > 640 && width <= 1024);
        };
        checkResponsive();
        window.addEventListener('resize', checkResponsive);
        return () => window.removeEventListener('resize', checkResponsive);
    }, []);

    const logActivity = async (action: string, details?: any) => {
        if (isPreview) return;
        try {
            await fetch("/api/store/activity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, details })
            });
        } catch (err) {
            console.error("[Activity Log] Error:", err);
        }
    };

    useEffect(() => {
        if (isPreview) return;
        fetch("/api/store/favorites")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFavorites(data.map((s: any) => s.id));
                }
            })
            .catch(console.error);
    }, [isPreview]);

    useEffect(() => {
        if (store.style?.mixUrl) {
            setStyle(store.currentStyleId, store.style.mixUrl);
            initPlayer(store.style.mixUrl, store.currentPosition, store.volume / 100);
        }
        if (store.isAutoMode) {
            setAutoMode(true);
        }
    }, []);

    useEffect(() => {
        if (lastPlayState.current !== null && lastPlayState.current !== isPlaying) {
            logActivity(isPlaying ? "PLAY" : "PAUSE", {
                styleId: currentStyleId,
                styleName: localStore.style?.name
            });
        }
        lastPlayState.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        if (!isAutoMode) return;
        const checkProgram = async () => {
            try {
                const res = await fetch("/api/store/current-program");
                const data = await res.json();
                if (data.style && data.style.id !== currentStyleId) {
                    handleStyleChange(data.style);
                }
            } catch (err) {
                console.error("[Auto-Mode] Sync error:", err);
            }
        };
        checkProgram();
        const programInterval = setInterval(checkProgram, 30000);
        return () => clearInterval(programInterval);
    }, [isAutoMode, currentStyleId]);

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

    useEffect(() => {
        return () => stop();
    }, []);

    const handleStyleChange = (style: any) => {
        if (!style || !style.mixUrl) return;
        initAudioContext();
        stop();
        setStyle(style.id, style.mixUrl);
        setLocalStore((prev: any) => ({ ...prev, style, currentStyleId: style.id }));
        initPlayer(style.mixUrl, 0, volume);
        togglePlay();

        fetch("/api/store/save-position", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position: progress, isPlaying: false })
        }).catch(console.error);

        fetch("/api/store/change-style", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ styleId: style.id })
        }).catch(console.error);

        logActivity("CHANGE_STYLE", {
            fromStyleId: currentStyleId,
            fromStyleName: localStore.style?.name,
            toStyleId: style.id,
            toStyleName: style.name
        });
    };

    const handleToggleFavorite = async (styleId: string) => {
        try {
            const res = await fetch("/api/store/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ styleId })
            });
            const data = await res.json();
            if (data.isFavorite) {
                setFavorites(prev => [...prev, styleId]);
            } else {
                setFavorites(prev => prev.filter(id => id !== styleId));
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

    // --- Render Logic ---

    // 1. Mobile & Tablet Layout (Responsive)
    if (isMobile && !isPreview) {
        return (
            <div className={styles.mobileContainer}>
                {/* Main List View (Behind overlay) */}
                <div className={styles.styleSection} style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
                    <div className={styles.styleHeader}>
                        <h2>Ambiances</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                className={clsx(styles.autoModeBtn, isAutoMode && styles.autoActive)}
                                onClick={handleAutoModeToggle}
                            >
                                <Zap size={14} fill={isAutoMode ? "currentColor" : "none"} />
                                <span>{isAutoMode ? "Auto" : "Manuel"}</span>
                            </button>
                            <button
                                className={styles.logoutBtn}
                                onClick={() => signOut()}
                                title="Déconnexion"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                    <StyleSelector
                        activeStyle={localStore.style?.slug}
                        onSelect={handleStyleChange}
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                    />
                </div>

                {/* Mini Player Bar (Bottom) */}
                <div
                    className={clsx(styles.miniBar, isMobileFullScreen && styles.hidden)}
                    onClick={() => setIsMobileFullScreen(true)}
                >
                    <div className={styles.miniArt}>
                        {localStore.style?.coverUrl ? (
                            <img src={localStore.style.coverUrl} alt="Cover" />
                        ) : (
                            <div className={styles.placeholderIcon}><Music size={20} /></div>
                        )}
                    </div>
                    <div className={styles.miniInfo}>
                        <div className={styles.miniTitle}>{localStore.style?.name || "Aucune lecture"}</div>
                        <div className={styles.miniSub}>{localStore.style?.name ? "En lecture" : "Sélectionnez une ambiance"}</div>
                    </div>
                    <div className={styles.miniPlay} onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </div>
                </div>

                {/* Full Screen Overlay */}
                <div className={clsx(styles.fullScreenOverlay, isMobileFullScreen && styles.open)}>
                    <div className={styles.mobileHeader}>
                        <button className={styles.closeBtn} onClick={() => setIsMobileFullScreen(false)}>
                            <ChevronDown size={32} />
                        </button>
                        <div className={styles.styleName}>En lecture</div>
                        <div style={{ width: 44 }}></div> {/* Spacer */}
                    </div>

                    <div className={styles.mobileCover}>
                        {localStore.style?.coverUrl ? (
                            <>
                                <img src={localStore.style.coverUrl} alt="Cover" />
                                {isPlaying && <div className={styles.mobileCoverGlow} />}
                            </>
                        ) : (
                            <div className={clsx(styles.coverArt, styles.mobileCoverPlaceholder)}>
                                <Music size={64} color="var(--muted-foreground)" />
                            </div>
                        )}
                    </div>

                    <div className={styles.mobileTrackInfo}>
                        <h1 className={styles.trackTitle}>Mix Continu</h1>
                        <p className={styles.styleName}>{localStore.style?.name || "Sélectionnez une ambiance"}</p>
                    </div>

                    <div className={styles.mobileControls}>
                        <button onClick={() => seekRelative(-15)} className={styles.seekButton}><SkipBack size={24} /></button>
                        <button onClick={togglePlay} className={styles.mobilePlayMain}>
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: 4 }} />}
                        </button>
                        <button onClick={() => seekRelative(15)} className={styles.seekButton}><SkipForward size={24} /></button>
                    </div>

                    <div className={styles.volumeWrapper} style={{ marginTop: 'auto' }}>
                        <VolumeKnob />
                    </div>
                </div>
            </div>
        );
    }


    // 2. Tablet "Dashboard" Layout
    if (isTablet && !isPreview) {
        return (
            <div className={styles.tabletContainer}>
                {/* Header */}
                <header className={styles.tabletHeader}>
                    <div className={styles.brand}>Aura Music</div>
                    <button className={styles.menuBtn} onClick={() => signOut()}>
                        <div className={styles.hamburger} />
                    </button>
                </header>

                {/* Hero Section */}
                <section className={styles.tabletHero}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroText}>
                            <h1 className={styles.heroTitle}>{localStore.style?.name || "Ready to Explore"}</h1>
                            <p className={styles.heroSubtitle}>{localStore.style?.description || "Select an ambiance to start your journey"}</p>
                        </div>
                        {localStore.style?.mixUrl && (
                            <button className={styles.heroPlayBtn} onClick={togglePlay}>
                                {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" style={{ marginLeft: 4 }} />}
                            </button>
                        )}
                    </div>
                    {/* Hero Background using Cover Art */}
                    <div className={styles.heroBackground}>
                        {localStore.style?.coverUrl && <img src={localStore.style.coverUrl} alt="Hero" />}
                        <div className={styles.heroOverlay} />
                    </div>
                </section>

                {/* Categories / Filters */}
                <div className={styles.tabletFilters}>
                    {["Tout", "Relax", "Voyage", "Énergie", "Instrumental"].map((filter, i) => (
                        <button key={filter} className={clsx(styles.filterPill, i === 0 && styles.filterActive)}>
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Horizontal Recommendations */}
                <div className={styles.tabletRecs}>
                    <div className={styles.recHeader}>
                        <h3>Recommandations</h3>
                        <span className={styles.seeAll}>Voir tout &gt;</span>
                    </div>
                    <div className={styles.recListWrapper}>
                        <StyleSelector
                            activeStyle={localStore.style?.slug}
                            onSelect={handleStyleChange}
                            favorites={favorites}
                            onToggleFavorite={handleToggleFavorite}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // 3. Desktop Premium Layout
    return (
        <div className={clsx(styles.container, isPreview && styles.previewContainer)}>
            <div className={styles.mainGrid}>
                {/* Left: Player Island */}
                <section className={styles.playerSection}>
                    <div className={styles.coverContainer}>
                        <div className={clsx(styles.coverArt, isPlaying && styles.playing)}>
                            {localStore.style?.coverUrl ? (
                                <img src={localStore.style.coverUrl} alt="Cover" className={styles.coverImage} />
                            ) : isPlaying ? (
                                <AudioVisualizer />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Music size={80} color="var(--border-highlight)" />
                                </div>
                            )}
                            <div className={styles.shimmer} />
                        </div>
                        {localStore.style?.coverUrl && isPlaying && <div className={styles.coverGlow} />}
                    </div>

                    <div className={styles.trackInfo}>
                        <div className={styles.titles}>
                            <h1 className={styles.trackTitle}>Mix Continu</h1>
                            <p className={styles.styleName}>
                                {localStore.style?.name || "Aucune ambiance sélectionnée"}
                            </p>
                            <div className={styles.timeInfo} style={{ marginTop: 8, opacity: 0.6 }}>
                                {formatTime(currentProgress)} / ∞
                            </div>
                        </div>
                    </div>

                    <div className={styles.controls}>
                        <button
                            onClick={() => seekRelative(-15)}
                            className={styles.seekButton}
                            disabled={!mixUrl}
                        >
                            <SkipBack size={24} />
                        </button>
                        <button
                            onClick={togglePlay}
                            className={styles.playButton}
                            disabled={!mixUrl}
                        >
                            {isPlaying ? (
                                <Pause size={36} fill="currentColor" />
                            ) : (
                                <Play size={36} fill="currentColor" style={{ marginLeft: 4 }} />
                            )}
                        </button>
                        <button
                            onClick={() => seekRelative(15)}
                            className={styles.seekButton}
                            disabled={!mixUrl}
                        >
                            <SkipForward size={24} />
                        </button>
                    </div>

                    <div className={styles.volumeWrapper}>
                        <VolumeKnob />
                    </div>
                </section>

                {/* Right: Style List */}
                <section className={styles.styleSection}>
                    <header className={styles.styleHeader}>
                        <h2>Ambiances</h2>
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
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                    />
                </section>
            </div>
        </div>
    );
}
