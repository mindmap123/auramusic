"use client";

import { useEffect, useState } from "react";
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
}

export default function StyleSelector({ activeStyle, onSelect }: StyleSelectorProps) {
    const [stylesList, setStylesList] = useState<Style[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className={styles.grid}>
            {stylesList.map((style) => {
                const isActive = activeStyle === style.slug;
                const hasMix = !!style.mixUrl;

                return (
                    <button
                        key={style.id}
                        className={clsx(
                            styles.card,
                            isActive && styles.active,
                            !hasMix && styles.noMix
                        )}
                        onClick={() => hasMix && onSelect(style.slug)}
                        disabled={!hasMix}
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
                        </div>
                        {!hasMix && (
                            <span className={styles.noMixBadge}>Bientôt</span>
                        )}
                        {isActive && hasMix && <div className={styles.indicator} />}
                    </button>
                );
            })}
        </div>
    );
}
