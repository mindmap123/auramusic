"use client";

import { useEffect, useState } from "react";
import { Heart, Play } from "lucide-react";
import styles from "./StyleSelector.module.css";
import { clsx } from "clsx";

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
    onSelect: (slug: string) => void;
    favorites?: string[];
    onToggleFavorite?: (styleId: string) => void;
}

export default function StyleSelector({ activeStyle, onSelect, favorites = [], onToggleFavorite }: StyleSelectorProps) {
    const [stylesList, setStylesList] = useState<Style[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if mobile
        const checkMobile = () => setIsMobile(window.innerWidth <= 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetch("/api/styles")
            .then(res => res.json())
            .then(data => {
                setStylesList(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

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
                            {isMobile && hasMix && !isActive && (
                                <button 
                                    className={styles.playBtn}
                                    onClick={() => onSelect(style.slug)}
                                >
                                    <Play size={18} fill="white" />
                                    <span>Lancer le mix</span>
                                </button>
                            )}
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
                        {/* Desktop click handler */}
                        {!isMobile && hasMix && (
                            <button 
                                className={styles.cardClickArea}
                                onClick={() => onSelect(style.slug)}
                                aria-label={`Jouer ${style.name}`}
                            />
                        )}
                        {!hasMix && <div className={styles.cardClickArea} style={{ cursor: 'not-allowed' }} />}
                        {isActive && hasMix && !isMobile && <div className={styles.indicator} />}
                    </div>
                );
            })}
        </div>
    );
}
