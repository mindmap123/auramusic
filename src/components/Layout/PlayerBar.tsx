"use client";

import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Music } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useShallow } from "zustand/react/shallow";
import { clsx } from "clsx";
import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./PlayerBar.module.css";

interface Style {
    id: string;
    name: string;
    description: string;
    coverUrl: string | null;
    icon: string;
}

interface PlayerBarProps {
    currentStyle: Style | null;
    onVolumeChange: (volume: number) => void;
}

const STEPS = 10;
const TRACK_PADDING = 12;

export default function PlayerBar({ currentStyle, onVolumeChange }: PlayerBarProps) {
    const {
        isPlaying,
        togglePlay,
        volume,
        setVolume,
        progress,
        seekRelative,
        mixUrl,
        isAutoMode,
    } = usePlayerStore(useShallow((state) => ({
        isPlaying: state.isPlaying,
        togglePlay: state.togglePlay,
        volume: state.volume,
        setVolume: state.setVolume,
        progress: state.progress,
        seekRelative: state.seekRelative,
        mixUrl: state.mixUrl,
        isAutoMode: state.isAutoMode,
    })));

    const [isDragging, setIsDragging] = useState(false);
    const volumeRef = useRef<HTMLDivElement>(null);

    const handleVolumeChange = useCallback((newVolume: number) => {
        const clamped = Math.max(0, Math.min(1, newVolume));
        setVolume(clamped);
        onVolumeChange(clamped);
    }, [setVolume, onVolumeChange]);

    const setByCoords = useCallback((clientX: number) => {
        if (!volumeRef.current) return;
        const rect = volumeRef.current.getBoundingClientRect();
        const trackWidth = rect.width - TRACK_PADDING * 2;
        const x = clientX - rect.left - TRACK_PADDING;
        handleVolumeChange(x / trackWidth);
    }, [handleVolumeChange]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setByCoords(e.clientX);
    }, [setByCoords]);

    useEffect(() => {
        if (!isDragging) return;
        const handleMouseMove = (e: MouseEvent) => setByCoords(e.clientX);
        const handleEnd = () => setIsDragging(false);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleEnd);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleEnd);
        };
    }, [isDragging, setByCoords]);

    const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <footer className={styles.playerBar}>
            {/* Left: Now Playing Info */}
            <div className={styles.nowPlaying}>
                <div className={styles.coverArt}>
                    {currentStyle?.coverUrl ? (
                        <img src={currentStyle.coverUrl} alt={currentStyle.name} />
                    ) : (
                        <div className={styles.coverPlaceholder}>
                            {currentStyle?.icon || <Music size={20} />}
                        </div>
                    )}
                </div>
                <div className={styles.trackInfo}>
                    <span className={styles.trackName}>
                        {currentStyle?.name || "Aucune ambiance"}
                    </span>
                    <span className={styles.artistName}>
                        {currentStyle ? "Mix Continu" : "Sélectionnez un style"}
                    </span>
                </div>
            </div>

            {/* Center: Playback Controls */}
            <div className={styles.controls}>
                <div className={styles.controlButtons}>
                    <button
                        className={clsx(styles.controlBtn, styles.secondary)}
                        onClick={() => seekRelative(-15)}
                        disabled={!mixUrl}
                        title="Reculer 15s"
                    >
                        <SkipBack size={20} />
                    </button>

                    <button
                        className={clsx(styles.controlBtn, styles.playBtn)}
                        onClick={togglePlay}
                        disabled={!mixUrl}
                    >
                        {isPlaying ? (
                            <Pause size={20} fill="currentColor" />
                        ) : (
                            <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
                        )}
                    </button>

                    <button
                        className={clsx(styles.controlBtn, styles.secondary)}
                        onClick={() => seekRelative(15)}
                        disabled={!mixUrl}
                        title="Avancer 15s"
                    >
                        <SkipForward size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className={styles.progressSection}>
                    <span className={styles.time}>{formatTime(progress)}</span>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${(progress % 3600) / 36}%` }}
                        />
                        <div
                            className={styles.progressDot}
                            style={{ left: `${(progress % 3600) / 36}%` }}
                        />
                    </div>
                    <span className={styles.time}>Loop</span>
                </div>
            </div>

            {/* Right: Volume & Extra Controls */}
            <div className={styles.extraControls}>
                {isAutoMode && (
                    <span className={styles.autoModeBadge}>AUTO</span>
                )}

                <div
                    ref={volumeRef}
                    className={clsx(styles.volumeControl, isDragging && styles.dragging)}
                    onMouseDown={handleMouseDown}
                >
                    <button
                        className={styles.volumeBtn}
                        onClick={(e) => { e.stopPropagation(); setVolume(volume > 0 ? 0 : 0.7); }}
                    >
                        <VolumeIcon size={20} />
                    </button>

                    <svg viewBox="0 0 120 24" className={styles.volumeSvg} preserveAspectRatio="none">
                        <defs>
                            {/* Gradient froid → chaud basé sur le volume */}
                            <linearGradient id="volGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(200, 80%, 50%)" />
                                <stop offset="50%" stopColor="hsl(60, 80%, 50%)" />
                                <stop offset="100%" stopColor="hsl(0, 80%, 55%)" />
                            </linearGradient>
                        </defs>

                        {/* Track background */}
                        <line x1={TRACK_PADDING} y1="12" x2={120 - TRACK_PADDING} y2="12"
                            stroke="var(--bg-highlight)" strokeWidth="4" strokeLinecap="round" />

                        {/* Track fill */}
                        <line x1={TRACK_PADDING} y1="12" x2={TRACK_PADDING + volume * (120 - TRACK_PADDING * 2)} y2="12"
                            stroke="url(#volGrad)" strokeWidth="4" strokeLinecap="round"
                            className={styles.volumeFill}
                            style={{ filter: `drop-shadow(0 0 6px hsl(${200 - volume * 200}, 80%, 50%))` }} />

                        {/* Graduation marks - couleur froid→chaud */}
                        {Array.from({ length: STEPS + 1 }, (_, i) => {
                            const progress = i / STEPS;
                            const x = TRACK_PADDING + progress * (120 - TRACK_PADDING * 2);
                            const isActive = progress <= volume;
                            // Hue: 200 (bleu) → 0 (rouge)
                            const hue = 200 - progress * 200;
                            return (
                                <line key={i} x1={x} y1="4" x2={x} y2="8"
                                    stroke={isActive ? `hsl(${hue}, 80%, 55%)` : "var(--text-subdued)"}
                                    strokeWidth="1.5" strokeLinecap="round"
                                    opacity={isActive ? 1 : 0.3}
                                    style={isActive ? { filter: `drop-shadow(0 0 3px hsl(${hue}, 80%, 55%))` } : {}}
                                    className={styles.gradMark} />
                            );
                        })}

                        {/* Thumb - couleur basée sur le volume */}
                        <circle cx={TRACK_PADDING + volume * (120 - TRACK_PADDING * 2)} cy="12" r="6"
                            fill={`hsl(${200 - volume * 200}, 80%, 60%)`}
                            className={styles.volumeThumb}
                            style={{ filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 8px hsl(${200 - volume * 200}, 80%, 50%))` }} />
                    </svg>
                </div>
            </div>
        </footer>
    );
}
