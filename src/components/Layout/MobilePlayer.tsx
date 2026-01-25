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

// Enhanced iOS-style pull-to-dismiss hook with Spotify-like UX
function usePullToDismiss(onDismiss: () => void) {
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const startTime = useRef(0);
    const lastY = useRef(0);
    const velocity = useRef(0);
    const animationFrame = useRef<number>();

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        // Prevent browser pull-to-refresh
        e.preventDefault();
        
        startY.current = e.touches[0].clientY;
        lastY.current = e.touches[0].clientY;
        startTime.current = Date.now();
        velocity.current = 0;
        setIsDragging(true);
        
        // Cancel any ongoing animation
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;

        // Prevent browser pull-to-refresh and scrolling
        e.preventDefault();
        e.stopPropagation();

        const currentY = e.touches[0].clientY;
        const rawDelta = Math.max(0, currentY - startY.current);

        // Calculate velocity (px/ms then convert to px/s)
        const now = Date.now();
        const dt = now - startTime.current;
        if (dt > 0) {
            velocity.current = ((currentY - lastY.current) / dt) * 1000;
        }
        lastY.current = currentY;
        startTime.current = now;

        // Spotify-like friction curve
        let dampedDelta;
        if (rawDelta <= 120) {
            // 1:1 tracking for first 120px
            dampedDelta = rawDelta;
        } else {
            // Progressive friction after 120px
            const excess = rawDelta - 120;
            const friction = Math.max(0.1, 1 - (excess / 300)); // Friction decreases with distance
            dampedDelta = 120 + (excess * friction);
        }

        setDragY(dampedDelta);
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);

        const screenHeight = window.innerHeight;
        const distanceThreshold = screenHeight * 0.25; // 25% of screen height
        const velocityThreshold = 800; // px/s for "flick" gesture

        // Dismiss conditions: distance OR velocity (flick)
        const shouldDismiss = dragY > distanceThreshold || velocity.current > velocityThreshold;

        if (shouldDismiss) {
            // Animate out with timing
            const startDragY = dragY;
            const targetY = screenHeight;
            const duration = 300;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-out cubic for smooth exit
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentY = startDragY + (targetY - startDragY) * easeOut;
                
                setDragY(currentY);
                
                if (progress < 1) {
                    animationFrame.current = requestAnimationFrame(animate);
                } else {
                    onDismiss();
                }
            };
            
            animate();
        } else {
            // Spring back to 0 with elastic animation
            const startDragY = dragY;
            const duration = 400;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Spring-like easing (elastic back)
                const spring = progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                const currentY = startDragY * (1 - spring);
                setDragY(currentY);
                
                if (progress < 1) {
                    animationFrame.current = requestAnimationFrame(animate);
                } else {
                    setDragY(0);
                }
            };
            
            animate();
        }

        velocity.current = 0;
    }, [dragY, onDismiss]);

    // Cleanup animation frame on unmount
    useEffect(() => {
        return () => {
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        };
    }, []);

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

    // Prevent body scroll and pull-to-refresh when player is expanded
    useEffect(() => {
        if (expanded) {
            // Disable body scroll and pull-to-refresh
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.overscrollBehavior = 'none';
            
            // Prevent default touch behaviors on the entire document
            const preventTouch = (e: TouchEvent) => {
                if (e.touches.length > 1) return; // Allow pinch zoom
                // Only prevent if we're not interacting with volume control
                const target = e.target as Element;
                if (!target.closest(`.${styles.volumeTrack}`)) {
                    e.preventDefault();
                }
            };
            
            document.addEventListener('touchmove', preventTouch, { passive: false });
            
            return () => {
                // Restore body scroll
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.overscrollBehavior = '';
                document.removeEventListener('touchmove', preventTouch);
            };
        }
    }, [expanded]);

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
                    transform: expanded 
                        ? `translateY(${dragY}px) scale(${Math.max(0.97, 1 - (dragY / 2000))})` 
                        : 'translateY(100%)',
                    transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.35s ease',
                    opacity: expanded ? Math.max(0.1, 1 - (dragY / 600)) : 0,
                    borderRadius: expanded ? `${Math.min(24, dragY / 8)}px ${Math.min(24, dragY / 8)}px 0 0` : '0px',
                }}
            >
                {/* Background */}
                <div
                    className={styles.expandedBg}
                    style={{
                        backgroundImage: currentStyle?.coverUrl
                            ? `url(${currentStyle.coverUrl})`
                            : undefined,
                        opacity: Math.max(0.05, 0.15 - (dragY / 1000)), // Background fades as we drag
                        transform: `scale(${Math.max(0.95, 1 - (dragY / 3000))})`, // Subtle scale effect
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
