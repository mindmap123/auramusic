"use client";

export const dynamic = "force-dynamic";

import nextDynamic from "next/dynamic";

const AnalyticsContent = nextDynamic(() => import("./AnalyticsContent"), {
    ssr: false,
    loading: () => <div style={{ padding: "2rem" }}>Chargement...</div>
});

export default function AnalyticsPage() {
    return <AnalyticsContent />;
}
