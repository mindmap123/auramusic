"use client";

import dynamic from "next/dynamic";

const TracksContent = dynamic(() => import("./TracksContent"), {
    ssr: false,
    loading: () => <div style={{ padding: "2rem" }}>Chargement...</div>
});

export default function TracksPage() {
    return <TracksContent />;
}
