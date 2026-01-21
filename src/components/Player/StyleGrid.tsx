"use client";

import { useEffect, useState, memo } from "react";
import { Play, Heart, Music } from "lucide-react";
import { clsx } from "clsx";
import { initAudioContext } from "@/lib/audioManager";
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

interface StyleCardProps {
    style: Style;
    isActive: boolean;
    isPlaying: boolean;
    isFavorite: boolean;
    onSelect: (style: Style) => void;
    onToggleFavorite?: (styleId: string) => void;
}

const StyleCard = memo(function StyleCard({
    style,
    isActive,
    isPlaying,
    isFavorite,
    onSelect,
    onToggleFavorite,
}: StyleCardProps) {
    const hasMix = !!style.mixUrl;

    const handleClick = () => {
        if (!hasMix) return;
        initAudioContext();
        onSelect(style);
    };

    return (
        <div
            className={clsx(
                styles.card,
                isActive && styles.active,
                !hasMix && styles.disabled
            )}
            onClick={handleClick}
            role="button"
            tabIndex={hasMix ? 0 : -1}
        >
            {/* Cover Art */}
            <div className={styles.coverWrapper}>
                <div className={styles.cover}>
                    {style.coverUrl ? (
                        <img src={style.coverUrl} alt={style.name} loading="lazy" />
                    ) : (
                        <div className={styles.coverPlaceholder}>
                            {style.icon || <Music size={32} />}
                        </div>
                    )}
                </div>

                {/* Play Button Overlay */}
                {hasMix && (
                    <button
                        className={styles.playButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
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
        </div>
    );
});

export default function StyleGrid({
    activeStyleId,
    onSelect,
    favorites = [],
    onToggleFavorite,
    isPlaying = false,
}: StyleGridProps) {
    const [stylesList, setStylesList] = useState<Style[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/styles")
            .then((res) => res.json())
            .then((data) => {
                setStylesList(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Sort: favorites first
    const sortedStyles = [...stylesList].sort((a, b) => {
        const aFav = favorites.includes(a.id) ? 0 : 1;
        const bFav = favorites.includes(b.id) ? 0 : 1;
        return aFav - bFav;
    });

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
        <div className={styles.grid}>
            {sortedStyles.map((style) => (
                <StyleCard
                    key={style.id}
                    style={style}
                    isActive={activeStyleId === style.id}
                    isPlaying={isPlaying}
                    isFavorite={favorites.includes(style.id)}
                    onSelect={onSelect}
                    onToggleFavorite={onToggleFavorite}
                />
            ))}
        </div>
    );
}
