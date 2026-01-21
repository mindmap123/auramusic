"use client";

import { Music } from "lucide-react";
import { clsx } from "clsx";
import styles from "./VinylCover.module.css";

interface VinylCoverProps {
    coverUrl: string | null | undefined;
    isPlaying: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function VinylCover({
    coverUrl,
    isPlaying,
    size = "md",
    className = "",
}: VinylCoverProps) {
    const sizeClasses = {
        sm: styles.sm,
        md: styles.md,
        lg: styles.lg,
    };

    return (
        <div className={clsx(styles.vinylContainer, sizeClasses[size], className)}>
            {/* Vinyl disc */}
            <div className={clsx(styles.vinylDisc, isPlaying && styles.spinning)}>
                <div className={styles.grooves}>
                    <div className={styles.groove} />
                    <div className={styles.groove} />
                    <div className={styles.groove} />
                </div>
            </div>

            {/* Cover art */}
            <div className={clsx(styles.coverWrapper, isPlaying && styles.spinning)}>
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt="Cover"
                        className={styles.coverImage}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <Music className={styles.placeholderIcon} />
                    </div>
                )}
                <div className={styles.centerHole}>
                    <div className={styles.centerDot} />
                </div>
            </div>
        </div>
    );
}
