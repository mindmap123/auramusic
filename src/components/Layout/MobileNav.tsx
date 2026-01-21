"use client";

import { Home, Radio, Heart, Settings } from "lucide-react";
import { clsx } from "clsx";
import styles from "./MobileNav.module.css";

interface MobileNavProps {
    currentView: "home" | "styles" | "favorites" | "settings";
    onViewChange: (view: "home" | "styles" | "favorites" | "settings") => void;
}

export default function MobileNav({ currentView, onViewChange }: MobileNavProps) {
    const navItems = [
        { id: "home" as const, icon: Home, label: "Accueil" },
        { id: "styles" as const, icon: Radio, label: "Styles" },
        { id: "favorites" as const, icon: Heart, label: "Favoris" },
        { id: "settings" as const, icon: Settings, label: "Réglages" },
    ];

    return (
        <nav className={styles.mobileNav}>
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={clsx(styles.navItem, currentView === item.id && styles.active)}
                    onClick={() => onViewChange(item.id)}
                >
                    <item.icon size={22} />
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
}
