"use client";

import { ReactNode } from "react";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
    children: ReactNode;
    sidebar?: ReactNode;
    playerBar?: ReactNode;
    accentColor?: string;
}

export default function AppLayout({
    children,
    sidebar,
    playerBar,
    accentColor = "green"
}: AppLayoutProps) {
    return (
        <div className={styles.appLayout} data-accent={accentColor}>
            {/* Sidebar */}
            {sidebar && (
                <div className={styles.sidebarWrapper}>
                    {sidebar}
                </div>
            )}

            {/* Main Content Area */}
            <div className={styles.mainWrapper}>
                <main className={styles.mainContent}>
                    {children}
                </main>
            </div>

            {/* Player Bar */}
            {playerBar && (
                <div className={styles.playerBarWrapper}>
                    {playerBar}
                </div>
            )}
        </div>
    );
}
