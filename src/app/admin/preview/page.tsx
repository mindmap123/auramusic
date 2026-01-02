"use client";

import dynamic from "next/dynamic";

const PreviewContent = dynamic(() => import("./PreviewContent"), {
    ssr: false,
    loading: () => <div style={{ padding: "2rem" }}>Chargement...</div>
});

export default function PreviewPage() {
    return <PreviewContent />;
}
