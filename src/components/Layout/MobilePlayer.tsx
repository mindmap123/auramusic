"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, ChevronUp, ChevronDown, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useShallow } from "zustand/react/shallow";
import { clsx } from "clsx";
import VinylCover from "@/components/Player/VinylCover";
import styles from "./MobilePlayer.module.css";

interface Style {
    id: string;
    name: string;
    description: string;
    coverUrl: string | null;
    icon: string;
}

interface MobilePlayerProps {
    currentStyle: Style | null;
    onVolumeChange: (volume: number) => void;
    onNavigateToStyles?: () => void;
}

// iOS-style pull-to-dismiss hook
function usePullToDismiss(onDismiss: () => void) {
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const startTime = useRef(0);
    const lastY = useRef(0);
    const velocity = useRef(0);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
        lastY.current = e.touches[0].clientY;
        startTime.current = Date.now();
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;

        const currentY = e.touches[0].clientY;
        const delta = Math.max(0, currentY - startY.current);

        // Calculate velocity in px/s
        const now = Date.now();
        const dt = now - startTime.current;
        if (dt > 0) {
            velocity.current = ((currentY - lastY.current) / dt) * 1000;
        }
        lastY.current = currentY;
        startTime.current = now;

        // Elastic resistance after 100px (iOS-style rubber banding)
        const dampedDelta = delta > 100
            ? 100 + (delta - 100) * 0.4
            : delta;

        setDragY(dampedDelta);
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);

        const screenHeight = window.innerHeight;
        const threshold = screenHeight * 0.3; // 30% like iOS
        const velocityThreshold = 500; // px/s

        // Dismiss if dragged past threshold OR fast enough swipe
        if (dragY > threshold || velocity.current > velocityThreshold) {
            onDismiss();
        }

        setDragY(0);
        velocity.current = 0;
    }, [dragY, onDismiss]);

    return {
        dragY,
        isDragging,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
    };
}

export default function MobilePlayer({ currentStyle, onVolumeChange, onNavigateToStyles }: MobilePlayerProps) {
    const [expanded, setExpanded] = useState(false);
    const [isVolumeDragging, setIsVolumeDragging] = useState(false);
    const volumeRef = useRef<HTMLDivElement>(null);

    const {
        isPlaying,
        togglePlay,
        mixUrl,
        seekRelative,
        volume,
        setVolume,
    } = usePlayerStore(useShallow((state) => ({
        isPlaying: state.isPlaying,
        togglePlay: state.togglePlay,
        mixUrl: state.mixUrl,
        seekRelative: state.seekRelative,
        volume: state.volume,
        setVolume: state.setVolume,
    })));

    // Volume control handlers
    const handleVolumeChange = useCallback((newVolume: number) => {
        const clamped = Math.max(0, Math.min(1, newVolume));
        setVolume(clamped);
        onVolumeChange(clamped);
    }, [setVolume, onVolumeChange]);

    const setVolumeByTouch = useCallback((clientX: number) => {
        if (!volumeRef.current) return;
        const rect = volumeRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        handleVolumeChange(x / rect.width);
    }, [handleVolumeChange]);

    const handleVolumeTouchStart = useCallback((e: React.TouchEvent) => {
        e.stopPropagation();
        setIsVolumeDragging(true);
        setVolumeByTouch(e.touches[0].clientX);
    }, [setVolumeByTouch]);

    useEffect(() => {
        if (!isVolumeDragging) return;
        const handleTouchMove = (e: TouchEvent) => setVolumeByTouch(e.touches[0].clientX);
        const handleEnd = () => setIsVolumeDragging(false);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleEnd);
        return () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleEnd);
        };
    }, [isVolumeDragging, setVolumeByTouch]);

    const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

    // Pull-to-dismiss hook
    const handleDismiss = useCallback(() => {
        setExpanded(false);
    }, []);

    const { dragY, isDragging, handlers } = usePullToDismiss(handleDismiss);

    const handleBarClick = useCallback(() => {
        setExpanded(true);
    }, []);

    const handleClose = useCallback(() => {
        setExpanded(false);
    }, []);

    return (
        <>
            {/* Mini Player Bar */}
            <div className={styles.miniPlayer} onClick={handleBarClick}>
                <VinylCover
                    coverUrl={currentStyle?.coverUrl}
                    isPlaying={isPlaying}
                    size="sm"
                    className={styles.miniVinyl}
                />

                <div className={styles.miniInfo}>
                    <span className={styles.miniTitle}>
                        {currentStyle?.name || "Aucune ambiance"}
                    </span>
                    <span className={styles.miniSubtitle}>
                        {currentStyle ? "Mix Continu" : "Sélectionnez un style"}
                    </span>
                </div>

                <ChevronUp size={18} className={styles.navHint} />

                <button
                    className={styles.miniPlayBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                    }}
                    disabled={!mixUrl}
                >
                    {isPlaying ? (
                        <Pause size={20} fill="currentColor" />
                    ) : (
                        <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
                    )}
                </button>
            </div>

            {/* Expanded Full Screen Player */}
            <div
                className={clsx(styles.expandedPlayer, expanded && styles.open)}
                {...handlers}
                style={{
                    transform: expanded ? `translateY(${dragY}px)` : 'translateY(100%)',
                    transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.35s ease',
                    opacity: expanded ? Math.max(0, 1 - (dragY / 400)) : 0,
                }}
            >
                {/* Background */}
                <div
                    className={styles.expandedBg}
                    style={{
                        backgroundImage: currentStyle?.coverUrl
                            ? `url(${currentStyle.coverUrl})`
                            : undefined,
                    }}
                />

                {/* Drag handle */}
                <div className={styles.dragHandle}>
                    <div className={styles.dragBar} />
                </div>

                {/* Close button */}
                <button className={styles.closeBtn} onClick={handleClose}>
                    <ChevronDown size={28} />
                </button>

                {/* Content */}
                <div className={styles.expandedContent}>
                    <div className={styles.vinylWrapper}>
                        <VinylCover
                            coverUrl={currentStyle?.coverUrl}
                            isPlaying={isPlaying}
                            size="lg"
                        />
                    </div>

                    <div className={styles.expandedInfo}>
                        <h2 className={styles.expandedTitle}>
                            {currentStyle?.name || "Aucune ambiance"}
                        </h2>
                        <p className={styles.expandedSubtitle}>
                            {currentStyle?.description || "Sélectionnez un style"}
                        </p>
                    </div>

                    <div className={styles.expandedControls}>
                        <button
                            className={styles.controlBtn}
                            onClick={() => seekRelative(-30)}
                            disabled={!mixUrl}
                        >
                            <SkipBack size={28} />
                        </button>

                        <button
                            className={styles.playBtnLarge}
                            onClick={togglePlay}
                            disabled={!mixUrl}
                        >
                            {isPlaying ? (
                                <Pause size={32} fill="currentColor" />
                            ) : (
                                <Play size={32} fill="currentColor" style={{ marginLeft: 4 }} />
                            )}
                        </button>

                        <button
                            className={styles.controlBtn}
                            onClick={() => seekRelative(30)}
                            disabled={!mixUrl}
                        >
                            <SkipForward size={28} />
                        </button>
                    </div>

                    <div className={styles.volumeSection}>
                        <button
                            className={styles.volumeBtn}
                            onClick={(e) => { e.stopPropagation(); setVolume(volume > 0 ? 0 : 0.7); }}
                        >
                            <VolumeIcon size={22} />
                        </button>
                        <div
                            ref={volumeRef}
                            className={styles.volumeTrack}
                            onTouchStart={handleVolumeTouchStart}
                        >
                            <div
                                className={styles.volumeFill}
                                style={{ width: `${volume * 100}%` }}
                            />
                            <div
                                className={styles.volumeThumb}
                                style={{ left: `${volume * 100}%` }}
                            />
                        </div>
                    </div>

                    {onNavigateToStyles && (
                        <button
                            className={styles.browseBtn}
                            onClick={() => {
                                handleClose();
                                onNavigateToStyles();
                            }}
                        >
                            Parcourir les styles
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
