"use client";

import { useState } from "react";
import { Play, Pause, ChevronDown, Music, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { clsx } from "clsx";
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
}

export default function MobilePlayer({ currentStyle, onVolumeChange }: MobilePlayerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const {
        isPlaying,
        togglePlay,
        volume,
        setVolume,
        progress,
        seekRelative,
        mixUrl,
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
        <>
            {/* Mini Player Bar */}
            <div
                className={clsx(styles.miniPlayer, isExpanded && styles.hidden)}
                onClick={() => setIsExpanded(true)}
            >
                <div className={styles.miniCover}>
                    {currentStyle?.coverUrl ? (
                        <img src={currentStyle.coverUrl} alt={currentStyle.name} />
                    ) : (
                        <div className={styles.miniPlaceholder}>
                            {currentStyle?.icon || <Music size={16} />}
                        </div>
                    )}
                </div>

                <div className={styles.miniInfo}>
                    <span className={styles.miniTitle}>
                        {currentStyle?.name || "Aucune ambiance"}
                    </span>
                    <span className={styles.miniSubtitle}>
                        {currentStyle ? "Mix Continu" : "Sélectionnez un style"}
                    </span>
                </div>

                <button
                    className={styles.miniPlayBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                    }}
                    disabled={!mixUrl}
                >
                    {isPlaying ? (
                        <Pause size={22} fill="currentColor" />
                    ) : (
                        <Play size={22} fill="currentColor" style={{ marginLeft: 2 }} />
                    )}
                </button>
            </div>

            {/* Fullscreen Player */}
            <div className={clsx(styles.fullPlayer, isExpanded && styles.open)}>
                {/* Header */}
                <div className={styles.fullHeader}>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setIsExpanded(false)}
                    >
                        <ChevronDown size={28} />
                    </button>
                    <span className={styles.headerTitle}>En lecture</span>
                    <div style={{ width: 44 }} />
                </div>

                {/* Cover Art */}
                <div className={styles.fullCover}>
                    {currentStyle?.coverUrl ? (
                        <>
                            <img src={currentStyle.coverUrl} alt={currentStyle.name} />
                            {isPlaying && <div className={styles.coverGlow} />}
                        </>
                    ) : (
                        <div className={styles.coverPlaceholder}>
                            {currentStyle?.icon || <Music size={64} />}
                        </div>
                    )}
                </div>

                {/* Track Info */}
                <div className={styles.fullInfo}>
                    <h1 className={styles.trackTitle}>
                        {currentStyle?.name || "Aucune ambiance"}
                    </h1>
                    <p className={styles.trackSubtitle}>Mix Continu</p>
                </div>

                {/* Progress */}
                <div className={styles.progressSection}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${(progress % 3600) / 36}%` }}
                        />
                    </div>
                    <div className={styles.progressTimes}>
                        <span>{formatTime(progress)}</span>
                        <span>Loop</span>
                    </div>
                </div>

                {/* Controls */}
                <div className={styles.fullControls}>
                    <button
                        className={styles.controlBtn}
                        onClick={() => seekRelative(-15)}
                        disabled={!mixUrl}
                    >
                        <SkipBack size={28} />
                    </button>

                    <button
                        className={styles.playBtn}
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
                        onClick={() => seekRelative(15)}
                        disabled={!mixUrl}
                    >
                        <SkipForward size={28} />
                    </button>
                </div>

                {/* Volume */}
                <div className={styles.volumeSection}>
                    <Volume2 size={20} className={styles.volumeIcon} />
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
        </>
    );
}
