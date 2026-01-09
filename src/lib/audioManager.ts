"use client";

// Simple Singleton pattern for the Audio element
let globalAudio: HTMLAudioElement | null = null;
let audioContextInitialized = false;
let audioContext: AudioContext | null = null;

// Initialize AudioContext on first user interaction (required for iOS)
export const initAudioContext = () => {
    if (audioContextInitialized) return;
    
    try {
        // Create AudioContext to unlock audio on iOS
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Resume if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Create and play a silent buffer to fully unlock
        const buffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        
        audioContextInitialized = true;
        console.log("[AudioManager] AudioContext initialized");
    } catch (e) {
        console.error("[AudioManager] Failed to init AudioContext:", e);
    }
};

export const getAudioInstance = () => {
    if (typeof window === "undefined") return null;
    if (!globalAudio) {
        globalAudio = new Audio();
        globalAudio.preload = "auto";
        globalAudio.crossOrigin = "anonymous";
        
        // Optimize for low latency
        if ('mozPreservesPitch' in globalAudio) {
            (globalAudio as any).mozPreservesPitch = false;
        }
    }
    return globalAudio;
};

// Preload audio URL for instant playback
export const preloadAudio = (url: string) => {
    if (!url || typeof window === "undefined") return;
    
    // Use link preload for browser-level caching
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'audio';
        link.href = url;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }
};

// Preload multiple audio URLs
export const preloadMultipleAudio = (urls: string[]) => {
    urls.forEach(url => preloadAudio(url));
};

export const stopAllAudio = () => {
    if (globalAudio) {
        globalAudio.pause();
        globalAudio.src = "";
    }
};
