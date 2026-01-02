"use client";

import dynamic from "next/dynamic";

const DashboardContent = dynamic(() => import("./DashboardContent"), {
    ssr: false,
    loading: () => <div style={{ padding: "2rem" }}>Chargement...</div>
});

export default function AdminDashboard() {
    return <DashboardContent />;
}
