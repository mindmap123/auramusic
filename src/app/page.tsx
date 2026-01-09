"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (session) {
            if ((session.user as any).role === "ADMIN") {
                router.replace("/admin/dashboard");
            } else {
                router.replace("/dashboard");
            }
        } else {
            router.replace("/login");
        }
    }, [session, status, router]);

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            background: "var(--background)"
        }}>
            <p style={{ color: "var(--muted-foreground)" }}>Chargement...</p>
        </div>
    );
}


