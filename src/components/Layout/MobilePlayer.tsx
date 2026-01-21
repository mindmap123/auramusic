"use client";

import { useState } from "react";
import { Play, Pause, ChevronUp, ChevronDown, SkipBack, SkipForward } from "lucide-react";
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

export default function MobilePlayer({ currentStyle, onNavigateToStyles }: MobilePlayerProps) {
    const [expanded, setExpanded] = useState(false);
    const {
        isPlaying,
        togglePlay,
        mixUrl,
        seekRelative,
    } = usePlayerStore(useShallow((state) => ({
        isPlaying: state.isPlaying,
        togglePlay: state.togglePlay,
        mixUrl: state.mixUrl,
        seekRelative: state.seekRelative,
    })));

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
