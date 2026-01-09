"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import styles from "./StyleSelector.module.css";
import { clsx } from "clsx";
import { preloadMultipleAudio, initAudioContext } from "@/lib/audioManager";

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

interface StyleSelectorProps {
    activeStyle: string | null;
    onSelect: (style: any) => void;
    favorites?: string[];
    onToggleFavorite?: (styleId: string) => void;
}

export default function StyleSelector({ activeStyle, onSelect, favorites = [], onToggleFavorite }: StyleSelectorProps) {
    const [stylesList, setStylesList] = useState<Style[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/styles")
            .then(res => res.json())
            .then(data => {
                setStylesList(data);
                setLoading(false);
                
                // Preload all mix URLs for instant playback
                const mixUrls = data
                    .filter((s: Style) => s.mixUrl)
                    .map((s: Style) => s.mixUrl as string);
                preloadMultipleAudio(mixUrls);
            })
            .catch(() => setLoading(false));
    }, []);

    // Initialize AudioContext on first touch (required for iOS)
    const handleCardClick = (style: Style) => {
        if (!style.mixUrl) return;
        
        // Init audio context on first tap
        initAudioContext();
        
        // Trigger selection immediately
        onSelect(style);
    };

    if (loading) {
        return (
            <div className={styles.grid}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={clsx(styles.card, "animate-pulse")} style={{ opacity: 0.3 }}>
                        <div className={styles.iconWrapper} />
                        <div className={styles.info}>
                            <div style={{ height: 16, width: 100, background: 'var(--secondary)', borderRadius: 4 }} />
                            <div style={{ height: 12, width: 150, background: 'var(--secondary)', borderRadius: 4, marginTop: 4 }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Sort: favorites first, then others
    const sortedStyles = [...stylesList].sort((a, b) => {
        const aFav = favorites.includes(a.id) ? 0 : 1;
        const bFav = favorites.includes(b.id) ? 0 : 1;
        return aFav - bFav;
    });

    return (
        <div className={styles.grid}>
            {sortedStyles.map((style) => {
                const isActive = activeStyle === style.slug;
                const hasMix = !!style.mixUrl;
                const isFavorite = favorites.includes(style.id);

                return (
                    <div
                        key={style.id}
                        className={clsx(
                            styles.card,
                            isActive && styles.active,
                            !hasMix && styles.noMix,
                            isFavorite && styles.favorite
                        )}
                        onClick={() => handleCardClick(style)}
                        role="button"
                        tabIndex={hasMix ? 0 : -1}
                    >
                        <div className={styles.iconWrapper}>
                            {style.coverUrl ? (
                                <img src={style.coverUrl} alt={style.name} />
                            ) : (
                                style.icon
                            )}
                        </div>
                        <div className={styles.info}>
                            <span className={styles.name}>{style.name}</span>
                            <span className={styles.description}>{style.description}</span>
                            {!hasMix && (
                                <span className={styles.noMixBadge}>Bientôt disponible</span>
                            )}
                        </div>
                        {onToggleFavorite && hasMix && (
                            <button
                                className={clsx(styles.favoriteBtn, isFavorite && styles.favoriteActive)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(style.id);
                                }}
                                title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                                <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                            </button>
                        )}
                        {isActive && hasMix && <div className={styles.indicator} />}
                    </div>
                );
            })}
        </div>
    );
}
