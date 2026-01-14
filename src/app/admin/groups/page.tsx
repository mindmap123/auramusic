"use client";

import dynamic from "next/dynamic";

const GroupsContent = dynamic(() => import("./GroupsContent"), {
    ssr: false,
    loading: () => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
            <p style={{ color: "var(--text-subdued)" }}>Chargement...</p>
        </div>
    )
});

export default function GroupsPage() {
    return <GroupsContent />;
}
