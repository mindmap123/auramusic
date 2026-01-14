"use client";

import { useEffect, useState } from "react";
import { Play, Heart, Music } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { preloadMultipleAudio, initAudioContext } from "@/lib/audioManager";
import styles from "./StyleGrid.module.css";

interface Style {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    colorTheme: string;
    mixUrl: string | null;
    coverUrl: string | null;
}

interface StyleGridProps {
    activeStyleId: string | null;
    onSelect: (style: Style) => void;
    favorites?: string[];
    onToggleFavorite?: (styleId: string) => void;
    isPlaying?: boolean;
}

export default function StyleGrid({
    activeStyleId,
    onSelect,
    favorites = [],
    onToggleFavorite,
    isPlaying = false,
}: StyleGridProps) {
    const [stylesList, setStylesList] = useState<Style[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/styles")
            .then((res) => res.json())
            .then((data) => {
                setStylesList(data);
                setLoading(false);

                const mixUrls = data
                    .filter((s: Style) => s.mixUrl)
                    .map((s: Style) => s.mixUrl as string);
                preloadMultipleAudio(mixUrls);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleCardClick = (style: Style) => {
        if (!style.mixUrl) return;
        initAudioContext();
        onSelect(style);
    };

    // Sort: favorites first
    const sortedStyles = [...stylesList].sort((a, b) => {
        const aFav = favorites.includes(a.id) ? 0 : 1;
        const bFav = favorites.includes(b.id) ? 0 : 1;
        return aFav - bFav;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 260,
                damping: 20
            }
        }
    };

    if (loading) {
        return (
            <div className={styles.grid}>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={clsx(styles.card, styles.skeleton)}>
                        <div className={styles.coverWrapper}>
                            <div className={styles.cover} />
                        </div>
                        <div className={styles.info}>
                            <div className={styles.skeletonTitle} />
                            <div className={styles.skeletonDesc} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <motion.div
            className={styles.grid}
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {sortedStyles.map((style) => {
                const isActive = activeStyleId === style.id;
                const hasMix = !!style.mixUrl;
                const isFavorite = favorites.includes(style.id);
                const isHovered = hoveredId === style.id;

                return (
                    <motion.div
                        key={style.id}
                        variants={itemVariants}
                        layout
                        className={clsx(
                            styles.card,
                            isActive && styles.active,
                            !hasMix && styles.disabled
                        )}
                        onClick={() => handleCardClick(style)}
                        onMouseEnter={() => setHoveredId(style.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        role="button"
                        tabIndex={hasMix ? 0 : -1}
                    >
                        {/* Cover Art */}
                        <div className={styles.coverWrapper}>
                            <div className={styles.cover}>
                                {style.coverUrl ? (
                                    <img src={style.coverUrl} alt={style.name} />
                                ) : (
                                    <div className={styles.coverPlaceholder}>
                                        {style.icon || <Music size={32} />}
                                    </div>
                                )}
                            </div>

                            {/* Play Button Overlay */}
                            {hasMix && (
                                <button
                                    className={clsx(
                                        styles.playButton,
                                        (isHovered || isActive) && styles.visible
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCardClick(style);
                                    }}
                                >
                                    <Play size={24} fill="currentColor" style={{ marginLeft: 2 }} />
                                </button>
                            )}

                            {/* Playing Indicator */}
                            {isActive && isPlaying && (
                                <div className={styles.playingIndicator}>
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className={styles.info}>
                            <span className={styles.name}>{style.name}</span>
                            <span className={styles.description}>{style.description}</span>

                            {!hasMix && (
                                <span className={styles.comingSoon}>Bientôt</span>
                            )}
                        </div>

                        {/* Favorite Button */}
                        {onToggleFavorite && hasMix && (
                            <button
                                className={clsx(
                                    styles.favoriteBtn,
                                    isFavorite && styles.favoriteActive
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(style.id);
                                }}
                                title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                                <Heart
                                    size={16}
                                    fill={isFavorite ? "currentColor" : "none"}
                                />
                            </button>
                        )}
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
