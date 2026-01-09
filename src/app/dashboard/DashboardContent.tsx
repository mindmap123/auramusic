"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Player from "@/components/Player/Player";
import styles from "./Dashboard.module.css";
import SignOutButton from "@/components/Auth/SignOutButton";

export default function DashboardContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;

        if (!session || (session.user as any).role !== "STORE") {
            router.replace("/login");
            return;
        }

        fetch("/api/stores/me")
            .then(res => res.json())
            .then(async (storeData) => {
                let currentPosition = 0;
                if (storeData.currentStyleId) {
                    try {
                        const posRes = await fetch(`/api/store/position?styleId=${storeData.currentStyleId}`);
                        const posData = await posRes.json();
                        currentPosition = posData.position || 0;
                    } catch (e) {}
                }
                setStore({ ...storeData, currentPosition });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [session, status, router]);

    if (status === "loading" || loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--background)" }}>
                <p style={{ color: "var(--muted-foreground)" }}>Chargement...</p>
            </div>
        );
    }

    if (!store) return null;

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <div className={styles.logo}><span className="gradient-text">AURA</span></div>
                <div className={styles.storeInfo}><span>{store.name}</span><SignOutButton /></div>
            </header>
            <main className={styles.main}><Player store={store} /></main>
        </div>
    );
}
