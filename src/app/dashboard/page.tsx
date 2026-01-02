"use client";

import dynamic from "next/dynamic";

const DashboardContent = dynamic(() => import("./DashboardContent"), {
    ssr: false,
    loading: () => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--background)" }}>
            <p style={{ color: "var(--muted-foreground)" }}>Chargement...</p>
        </div>
    )
});

export default function DashboardPage() {
    return <DashboardContent />;
}
