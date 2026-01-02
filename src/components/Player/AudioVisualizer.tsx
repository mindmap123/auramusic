"use client";

import styles from "./AudioVisualizer.module.css";
import { clsx } from "clsx";

interface AudioVisualizerProps {
    size?: "small" | "medium" | "large";
}

export default function AudioVisualizer({ size = "medium" }: AudioVisualizerProps) {
    const barCount = size === "small" ? 3 : 5;

    return (
        <div className={clsx(styles.visualizer, styles[size])}>
            {[...Array(barCount)].map((_, i) => (
                <div
                    key={i}
                    className={styles.bar}
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    );
}
