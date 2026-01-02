"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import styles from "./VolumeControl.module.css";
import { clsx } from "clsx";
import { useRef } from "react";

interface VolumeControlProps {
    compact?: boolean;
}

export default function VolumeControl({ compact = false }: VolumeControlProps) {
    const { volume, setVolume } = usePlayerStore();
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);

        // Debounce DB update
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            updateVolumeInDb(newVolume);
        }, 300);
    };

    const updateVolumeInDb = async (v: number) => {
        try {
            await fetch("/api/stores/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ volume: Math.round(v * 100) })
            });
        } catch (err) {
            console.error("Failed to save volume:", err);
        }
    };

    const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
    const percentage = Math.round(volume * 100);

    return (
        <div className={clsx(styles.container, compact && styles.compact)}>
            <VolumeIcon size={compact ? 16 : 20} className={styles.icon} />
            <div className={styles.sliderWrapper}>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className={styles.slider}
                    style={{ '--volume-percent': `${percentage}%` } as React.CSSProperties}
                />
            </div>
            <span className={styles.percentage}>{percentage}%</span>
        </div>
    );
}
