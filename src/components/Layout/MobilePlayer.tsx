"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, ChevronUp, ChevronDown, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useShallow } from "zustand/react/shallow";
import { motion, AnimatePresence } from "framer-motion";
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

export default function MobilePlayer({ currentStyle, onVolumeChange, onNavigateToStyles }: MobilePlayerProps) {
    const [expanded, setExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
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

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.stopPropagation();
        setIsDragging(true);
        setVolumeByTouch(e.touches[0].clientX);
    }, [setVolumeByTouch]);

    useEffect(() => {
        if (!isDragging) return;
        const handleTouchMove = (e: TouchEvent) => setVolumeByTouch(e.touches[0].clientX);
        const handleEnd = () => setIsDragging(false);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleEnd);
        return () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, setVolumeByTouch]);

    const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

    const handleBarClick = () => {
        setExpanded(true);
    };

    const handleClose = () => {
        setExpanded(false);
    };

    return (
        <>
            {/* Mini Player Bar */}
            <div className={styles.miniPlayer} onClick={handleBarClick}>
                {/* Vinyl Cover */}
                <VinylCover
                    coverUrl={currentStyle?.coverUrl}
                    isPlaying={isPlaying}
                    size="sm"
                    className={styles.miniVinyl}
                />

                {/* Info */}
                <div className={styles.miniInfo}>
                    <span className={styles.miniTitle}>
                        {currentStyle?.name || "Aucune ambiance"}
                    </span>
                    <span className={styles.miniSubtitle}>
                        {currentStyle ? "Mix Continu" : "Sélectionnez un style"}
                    </span>
                </div>

                {/* Navigate hint */}
                <ChevronUp size={18} className={styles.navHint} />

                {/* Play/Pause Button */}
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
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        className={styles.expandedPlayer}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    >
                        {/* Background gradient based on cover */}
                        <div
                            className={styles.expandedBg}
                            style={{
                                backgroundImage: currentStyle?.coverUrl
                                    ? `url(${currentStyle.coverUrl})`
                                    : undefined,
                            }}
                        />

                        {/* Close button */}
                        <button className={styles.closeBtn} onClick={handleClose}>
                            <ChevronDown size={28} />
                        </button>

                        {/* Content */}
                        <div className={styles.expandedContent}>
                            {/* Vinyl */}
                            <div className={styles.vinylWrapper}>
                                <VinylCover
                                    coverUrl={currentStyle?.coverUrl}
                                    isPlaying={isPlaying}
                                    size="lg"
                                />
                            </div>

                            {/* Track Info */}
                            <div className={styles.expandedInfo}>
                                <h2 className={styles.expandedTitle}>
                                    {currentStyle?.name || "Aucune ambiance"}
                                </h2>
                                <p className={styles.expandedSubtitle}>
                                    {currentStyle?.description || "Sélectionnez un style"}
                                </p>
                            </div>

                            {/* Controls */}
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

                            {/* Volume Control */}
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
                                    onTouchStart={handleTouchStart}
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

                            {/* Browse styles button */}
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
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
