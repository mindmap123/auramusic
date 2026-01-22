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

// Velocity tracking for momentum-based dismiss
const VELOCITY_THRESHOLD = 0.5; // px/ms - dismiss if swiping fast enough
const DISTANCE_THRESHOLD = 150; // px - dismiss if dragged far enough

export default function MobilePlayer({ currentStyle, onVolumeChange, onNavigateToStyles }: MobilePlayerProps) {
    const [expanded, setExpanded] = useState(false);
    const [isVolumeDragging, setIsVolumeDragging] = useState(false);

    // Refs for performant drag tracking (no re-renders during drag)
    const expandedRef = useRef<HTMLDivElement>(null);
    const volumeRef = useRef<HTMLDivElement>(null);
    const dragState = useRef({
        isDragging: false,
        startY: 0,
        currentY: 0,
        startTime: 0,
        lastY: 0,
        lastTime: 0,
        velocity: 0,
    });

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

    // Optimized swipe handlers using refs for performance
    const updateTransform = useCallback((y: number, animate: boolean) => {
        if (!expandedRef.current) return;
        const el = expandedRef.current;
        el.style.transition = animate ? 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease' : 'none';
        el.style.transform = `translateY(${y}px)`;
        el.style.opacity = String(1 - (y / 500));
    }, []);

    const handleSwipeStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        const now = Date.now();
        dragState.current = {
            isDragging: true,
            startY: touch.clientY,
            currentY: touch.clientY,
            startTime: now,
            lastY: touch.clientY,
            lastTime: now,
            velocity: 0,
        };
    }, []);

    const handleSwipeMove = useCallback((e: React.TouchEvent) => {
        const state = dragState.current;
        if (!state.isDragging) return;

        const touch = e.touches[0];
        const now = Date.now();
        const deltaTime = now - state.lastTime;

        // Calculate velocity (px/ms)
        if (deltaTime > 0) {
            state.velocity = (touch.clientY - state.lastY) / deltaTime;
        }

        state.currentY = touch.clientY;
        state.lastY = touch.clientY;
        state.lastTime = now;

        // Only allow downward drag
        const dragDistance = Math.max(0, state.currentY - state.startY);

        // Direct DOM manipulation for smooth 60fps
        requestAnimationFrame(() => {
            updateTransform(dragDistance, false);
        });
    }, [updateTransform]);

    const handleSwipeEnd = useCallback(() => {
        const state = dragState.current;
        if (!state.isDragging) return;

        state.isDragging = false;
        const dragDistance = Math.max(0, state.currentY - state.startY);

        // Dismiss if: dragged far enough OR swiping fast enough downward
        const shouldDismiss = dragDistance > DISTANCE_THRESHOLD || state.velocity > VELOCITY_THRESHOLD;

        if (shouldDismiss) {
            // Animate to fully closed
            requestAnimationFrame(() => {
                updateTransform(window.innerHeight, true);
            });
            // Update React state after animation
            setTimeout(() => setExpanded(false), 300);
        } else {
            // Snap back to open position
            requestAnimationFrame(() => {
                updateTransform(0, true);
            });
        }
    }, [updateTransform]);

    // Reset transform when expanded state changes
    useEffect(() => {
        if (!expandedRef.current) return;
        if (expanded) {
            expandedRef.current.style.transform = 'translateY(0)';
            expandedRef.current.style.opacity = '1';
        } else {
            expandedRef.current.style.transform = 'translateY(100%)';
            expandedRef.current.style.opacity = '0';
        }
    }, [expanded]);

    const handleBarClick = useCallback(() => {
        setExpanded(true);
    }, []);

    const handleClose = useCallback(() => {
        requestAnimationFrame(() => {
            updateTransform(window.innerHeight, true);
        });
        setTimeout(() => setExpanded(false), 300);
    }, [updateTransform]);

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
                ref={expandedRef}
                className={clsx(styles.expandedPlayer, expanded && styles.open)}
                onTouchStart={handleSwipeStart}
                onTouchMove={handleSwipeMove}
                onTouchEnd={handleSwipeEnd}
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
