"use client";

import { Home, Radio, Heart, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { clsx } from "clsx";
import styles from "./Sidebar.module.css";

interface SidebarProps {
    storeName: string;
    currentView: "home" | "styles" | "favorites" | "settings";
    onViewChange: (view: "home" | "styles" | "favorites" | "settings") => void;
}

export default function Sidebar({ storeName, currentView, onViewChange }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { id: "home" as const, icon: Home, label: "Accueil" },
        { id: "styles" as const, icon: Radio, label: "Styles" },
        { id: "favorites" as const, icon: Heart, label: "Favoris" },
        { id: "settings" as const, icon: Settings, label: "Paramètres" },
    ];

    return (
        <aside className={clsx(styles.sidebar, collapsed && styles.collapsed)}>
            {/* Logo */}
            <div className={styles.logoSection}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>A</span>
                    {!collapsed && <span className={styles.logoText}>Aura</span>}
                </div>
                <button
                    className={styles.collapseBtn}
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                className={clsx(
                                    styles.navItem,
                                    currentView === item.id && styles.active
                                )}
                                onClick={() => onViewChange(item.id)}
                            >
                                <item.icon size={24} />
                                {!collapsed && <span>{item.label}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Store Info & Logout */}
            <div className={styles.footer}>
                <div className={styles.storeInfo}>
                    <div className={styles.storeAvatar}>
                        {storeName.charAt(0).toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className={styles.storeDetails}>
                            <span className={styles.storeName}>{storeName}</span>
                            <span className={styles.storeLabel}>Magasin</span>
                        </div>
                    )}
                </div>
                <button
                    className={styles.logoutBtn}
                    onClick={() => signOut()}
                    title="Déconnexion"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </aside>
    );
}
