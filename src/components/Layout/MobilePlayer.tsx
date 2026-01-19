"use client";

import { Play, Pause, Music, ChevronUp } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useShallow } from "zustand/react/shallow";
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
    const {
        isPlaying,
        togglePlay,
        mixUrl,
    } = usePlayerStore(useShallow((state) => ({
        isPlaying: state.isPlaying,
        togglePlay: state.togglePlay,
        mixUrl: state.mixUrl,
    })));

    const handleBarClick = () => {
        if (onNavigateToStyles) {
            onNavigateToStyles();
        }
    };

    return (
        <div className={styles.miniPlayer} onClick={handleBarClick}>
            {/* Cover */}
            <div className={styles.miniCover}>
                {currentStyle?.coverUrl ? (
                    <img src={currentStyle.coverUrl} alt={currentStyle.name} />
                ) : (
                    <div className={styles.miniPlaceholder}>
                        {currentStyle?.icon || <Music size={16} />}
                    </div>
                )}
            </div>

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
    );
}
