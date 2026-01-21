"use client";

import { motion } from "framer-motion";
import { Music } from "lucide-react";
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
        <div className={`${styles.vinylContainer} ${sizeClasses[size]} ${className}`}>
            {/* Vinyl disc (visible part behind the cover) */}
            <motion.div
                className={styles.vinylDisc}
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{
                    duration: 3,
                    repeat: isPlaying ? Infinity : 0,
                    ease: "linear",
                }}
            >
                {/* Vinyl grooves */}
                <div className={styles.grooves}>
                    <div className={styles.groove} />
                    <div className={styles.groove} />
                    <div className={styles.groove} />
                </div>
            </motion.div>

            {/* Cover art (on top) */}
            <motion.div
                className={styles.coverWrapper}
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{
                    duration: 20,
                    repeat: isPlaying ? Infinity : 0,
                    ease: "linear",
                }}
            >
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt="Cover"
                        className={styles.coverImage}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <Music className={styles.placeholderIcon} />
                    </div>
                )}

                {/* Center hole overlay */}
                <div className={styles.centerHole}>
                    <div className={styles.centerDot} />
                </div>
            </motion.div>

            {/* Reflection effect */}
            <div className={styles.reflection} />
        </div>
    );
}
