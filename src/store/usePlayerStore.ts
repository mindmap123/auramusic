import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAudioInstance, initAudioContext } from '@/lib/audioManager';

interface PlayerState {
    isPlaying: boolean;
    volume: number;
    progress: number;
    currentStyleId: string | null;
    mixUrl: string | null;
    isAutoMode: boolean;

    // Actions
    initPlayer: (mixUrl: string, startPosition: number, volume: number) => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    setProgress: (progress: number) => void;
    setStyle: (styleId: string, mixUrl: string) => void;
    setAutoMode: (auto: boolean) => void;
    seek: (seconds: number) => void;
    seekRelative: (delta: number) => void;
    stop: () => void;
}

export const usePlayerStore = create<PlayerState>((persist((set, get) => ({
    isPlaying: false,
    volume: 0.7,
    progress: 0,
    currentStyleId: null,
    mixUrl: null,
    isAutoMode: false,

    initPlayer: (mixUrl, startPosition, volume) => {
        const audio = getAudioInstance();
        if (!audio) return;

        audio.pause();

        if (!mixUrl) {
            console.error("[PlayerStore] No mixUrl provided!");
            return;
        }

        audio.src = mixUrl;
        audio.volume = volume;
        audio.loop = true;

        // Hint the browser to start fetching immediately.
        // This helps mobile Safari where caching/preload behavior can be less eager.
        try {
            audio.load();
        } catch {
            // ignore
        }

        audio.onplay = () => set({ isPlaying: true });
        audio.onpause = () => set({ isPlaying: false });
        audio.ontimeupdate = () => {
            set({ progress: Math.floor(audio.currentTime) });
        };

        const onLoaded = () => {
            if (startPosition > 0) {
                try {
                    audio.currentTime = startPosition;
                } catch {
                    // If seeking fails (rare on iOS before data is available), we still allow instant play.
                }
            }
            audio.removeEventListener('loadedmetadata', onLoaded);
        };
        audio.addEventListener('loadedmetadata', onLoaded, { once: true } as any);

        const currentState = get();
        set({ mixUrl, volume, currentStyleId: currentState?.currentStyleId || null });
    },

    togglePlay: () => {
        // Initialize AudioContext on first play (required for iOS)
        initAudioContext();

        const audio = getAudioInstance();
        if (!audio) return;

        const { mixUrl, progress } = get();

        if (!mixUrl) {
            console.error("[PlayerStore] Cannot play: No mix URL loaded");
            return;
        }

        if (!audio.src || audio.src === window.location.href) {
            audio.src = mixUrl;
            audio.loop = true;

            // Load immediately so play() resolves faster on mobile.
            try {
                audio.load();
            } catch {
                // ignore
            }

            // Don't block play on a seek: seeking before metadata can delay startup on iOS.
            // We'll apply the seek once metadata is available.
            if (progress > 0) {
                const seekOnce = () => {
                    try {
                        audio.currentTime = progress;
                    } catch {
                        // ignore
                    }
                    audio.removeEventListener('loadedmetadata', seekOnce);
                };
                audio.addEventListener('loadedmetadata', seekOnce, { once: true } as any);
            }
        }

        if (get().isPlaying) {
            audio.pause();
        } else {
            // Play immediately - don't wait
            audio.play().catch(console.error);
        }
    },

    setVolume: (volume) => {
        const audio = getAudioInstance();
        if (audio) audio.volume = volume;
        set({ volume });
    },

    setProgress: (progress) => set({ progress }),

    setStyle: (styleId, mixUrl) => {
        set({ currentStyleId: styleId, mixUrl });
    },

    setAutoMode: (auto) => set({ isAutoMode: auto }),

    seek: (seconds) => {
        const audio = getAudioInstance();
        if (audio) {
            audio.currentTime = seconds;
            set({ progress: seconds });
        }
    },

    seekRelative: (delta) => {
        const audio = getAudioInstance();
        if (audio && audio.duration) {
            const newTime = Math.max(0, Math.min(audio.duration, audio.currentTime + delta));
            audio.currentTime = newTime;
            set({ progress: Math.floor(newTime) });
        }
    },

    stop: () => {
        const audio = getAudioInstance();
        if (audio) {
            audio.pause();
            // Keep src to preserve buffer/cache for faster resume on mobile.
            // We still reset progress state.
            try {
                audio.currentTime = 0;
            } catch {
                // ignore
            }
            set({ isPlaying: false, progress: 0 });
        }
    }
}), {
    name: 'player-storage',
    partialize: (state) => ({
        volume: state.volume,
        currentStyleId: state.currentStyleId,
        mixUrl: state.mixUrl,
        isAutoMode: state.isAutoMode
    }),
})) as any);
