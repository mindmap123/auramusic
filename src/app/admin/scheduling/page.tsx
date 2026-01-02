"use client";

import dynamic from "next/dynamic";

const SchedulingContent = dynamic(() => import("./SchedulingContent"), {
    ssr: false,
    loading: () => <div style={{ padding: "2rem" }}>Chargement...</div>
});

export default function SchedulingPage() {
    return <SchedulingContent />;
}
