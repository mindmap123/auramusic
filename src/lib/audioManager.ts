"use client";

// Simple Singleton pattern for the Audio element
let globalAudio: HTMLAudioElement | null = null;

export const getAudioInstance = () => {
    if (typeof window === "undefined") return null;
    if (!globalAudio) {
        globalAudio = new Audio();
        globalAudio.preload = "auto";
    }
    return globalAudio;
};

export const stopAllAudio = () => {
    if (globalAudio) {
        globalAudio.pause();
        globalAudio.src = "";
    }
};
