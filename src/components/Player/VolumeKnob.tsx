"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import { useRef, useState, useCallback, useEffect } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import styles from "./VolumeKnob.module.css";

const STEPS = 12; // Number of graduation marks
const TRACK_PADDING = 24; // Padding on each side for thumb

export default function VolumeKnob() {
    const { volume, setVolume } = usePlayerStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const [isDragging, setIsDragging] = useState(false);

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

    const handleVolumeChange = useCallback((newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolume(clampedVolume);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            updateVolumeInDb(clampedVolume);
        }, 300);
    }, [setVolume]);

    const setByCoords = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const trackWidth = rect.width - TRACK_PADDING * 2;
        const x = clientX - rect.left - TRACK_PADDING;
        const newVolume = x / trackWidth;
        
        handleVolumeChange(newVolume);
    }, [handleVolumeChange]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setByCoords(e.clientX);
    }, [setByCoords]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        setIsDragging(true);
        setByCoords(e.touches[0].clientX);
    }, [setByCoords]);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => setByCoords(e.clientX);
        const handleTouchMove = (e: TouchEvent) => setByCoords(e.touches[0].clientX);
        const handleEnd = () => setIsDragging(false);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleEnd);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, setByCoords]);

    // SVG dimensions
    const svgWidth = 300;
    const svgHeight = 48;
    const trackY = svgHeight / 2;
    const trackStart = TRACK_PADDING;
    const trackEnd = svgWidth - TRACK_PADDING;
    const trackLength = trackEnd - trackStart;
    
    // Thumb position
    const thumbX = trackStart + volume * trackLength;
    
    // Generate graduation marks
    const graduations = Array.from({ length: STEPS + 1 }, (_, i) => {
        const progress = i / STEPS;
        const x = trackStart + progress * trackLength;
        const isActive = progress <= volume;
        const hue = 250 + progress * 30; // Purple gradient
        return { x, isActive, hue };
    });

    const percentage = Math.round(volume * 100);
    const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

    return (
        <div className={styles.container}>
            <VolumeIcon size={20} className={styles.icon} />
            
            <div 
                ref={containerRef}
                className={`${styles.knobWrapper} ${isDragging ? styles.dragging : ''}`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <svg 
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                    className={styles.svg}
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--primary, #8b5cf6)" />
                            <stop offset="100%" stopColor="var(--accent, #a855f7)" />
                        </linearGradient>
                    </defs>

                    {/* Track background */}
                    <line
                        x1={trackStart}
                        y1={trackY}
                        x2={trackEnd}
                        y2={trackY}
                        className={styles.trackBg}
                    />

                    {/* Track fill */}
                    <line
                        x1={trackStart}
                        y1={trackY}
                        x2={thumbX}
                        y2={trackY}
                        className={styles.trackFill}
                    />

                    {/* Graduation marks */}
                    <g className={styles.graduations}>
                        {graduations.map(({ x, isActive, hue }, index) => (
                            <line
                                key={index}
                                x1={x}
                                y1={trackY - 12}
                                x2={x}
                                y2={trackY - 6}
                                className={`${styles.gradMark} ${isActive ? styles.active : ''}`}
                                style={{ '--hue': hue } as React.CSSProperties}
                            />
                        ))}
                    </g>

                    {/* Thumb glow */}
                    <circle
                        cx={thumbX}
                        cy={trackY}
                        r={14}
                        className={styles.thumbGlow}
                    />

                    {/* Thumb */}
                    <circle
                        cx={thumbX}
                        cy={trackY}
                        r={9}
                        className={styles.thumb}
                    />
                </svg>
            </div>

            <span className={styles.percentage}>{percentage}%</span>

            {/* Hidden range for accessibility */}
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className={styles.hiddenRange}
                aria-label="Volume"
            />
        </div>
    );
}
