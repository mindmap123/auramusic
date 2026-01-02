"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Music, BarChart3, LogOut, Clock, Eye, Menu, X, Activity } from "lucide-react";
import { signOut } from "next-auth/react";
import styles from "./AdminLayout.module.css";
import { clsx } from "clsx";

const menuItems = [
    { name: "Vue d'ensemble", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Magasins", href: "/admin/stores", icon: Store },
    { name: "Radios & Mixes", href: "/admin/tracks", icon: Music },
    { name: "Programmation", href: "/admin/scheduling", icon: Clock },
    { name: "Statistiques", href: "/admin/analytics", icon: BarChart3 },
    { name: "Activité", href: "/admin/activity", icon: Activity },
    { name: "Aperçu", href: "/admin/preview", icon: Eye },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className={styles.layout}>
            {/* Mobile Header */}
            <header className={styles.mobileHeader}>
                <span className={clsx(styles.mobileLogo, "gradient-text")}>Aura Admin</span>
                <button 
                    className={styles.menuToggle}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Overlay */}
            <div 
                className={clsx(styles.overlay, sidebarOpen && styles.visible)}
                onClick={closeSidebar}
            />

            {/* Sidebar */}
            <aside className={clsx(styles.sidebar, sidebarOpen && styles.open)}>
                <div className={styles.logo}>
                    <span className="gradient-text">Aura Admin</span>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(styles.navItem, pathname === item.href && styles.active)}
                            onClick={closeSidebar}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <button onClick={() => signOut()} className={styles.logout}>
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                </button>
            </aside>

            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
