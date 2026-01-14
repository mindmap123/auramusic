"use client";

import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Music } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { clsx } from "clsx";
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
    } = usePlayerStore();

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        onVolumeChange(newVolume);
    };

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

                <div className={styles.volumeControl}>
                    <button
                        className={styles.volumeBtn}
                        onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                    >
                        {volume === 0 ? (
                            <VolumeX size={20} />
                        ) : (
                            <Volume2 size={20} />
                        )}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className={styles.volumeSlider}
                    />
                </div>
            </div>
        </footer>
    );
}
