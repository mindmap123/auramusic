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
        const x = clientX - rect.left;
        handleVolumeChange(x / rect.width);
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

                    <div className={styles.volumeTrack}>
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
            </div>
        </footer>
    );
}
