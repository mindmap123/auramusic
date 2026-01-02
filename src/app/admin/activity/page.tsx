"use client";

import dynamic from "next/dynamic";

const ActivityContent = dynamic(() => import("./ActivityContent"), { ssr: false });

export default function ActivityPage() {
    return <ActivityContent />;
}
