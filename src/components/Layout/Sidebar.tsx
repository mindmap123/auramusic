"use client";

import { Home, Radio, Heart, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { clsx } from "clsx";
import Image from "next/image";
import styles from "./Sidebar.module.css";

interface SidebarProps {
    storeName: string;
    currentView: "home" | "styles" | "favorites" | "settings";
    onViewChange: (view: "home" | "styles" | "favorites" | "settings") => void;
    accentColor?: string;
}

export default function Sidebar({ storeName, currentView, onViewChange, accentColor = "green" }: SidebarProps) {
    const navItems = [
        { id: "home" as const, icon: Home, label: "Accueil" },
        { id: "styles" as const, icon: Radio, label: "Styles" },
        { id: "favorites" as const, icon: Heart, label: "Favoris" },
        { id: "settings" as const, icon: Settings, label: "Paramètres" },
    ];

    return (
        <aside className={styles.sidebar}>
            {/* Logo */}
            <div className={styles.logoSection}>
                <button 
                    className={styles.logo}
                    onClick={() => onViewChange("home")}
                    aria-label="Retour à l'accueil"
                >
                    <Image
                        src={`/images/logos/logo-${accentColor}.svg`}
                        alt="Aura Music"
                        width={180}
                        height={60}
                        style={{
                            width: 'auto',
                            height: '180px',
                            objectFit: 'contain'
                        }}
                        priority
                        className={styles.logoFull}
                    />
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
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Store Info & Logout */}
            <div className={styles.footer}>
                <div className={styles.storeInfo}>
                    <div className={styles.storeAvatar}>
                        {(storeName || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.storeDetails}>
                        <span className={styles.storeName}>{storeName}</span>
                        <span className={styles.storeLabel}>Magasin</span>
                    </div>
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
