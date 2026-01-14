"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Store,
    Music,
    BarChart3,
    LogOut,
    Clock,
    Eye,
    Menu,
    X,
    Activity,
    Radio,
    Users,
    Zap,
} from "lucide-react";
import { signOut } from "next-auth/react";
import styles from "./AdminLayout.module.css";
import { clsx } from "clsx";

const menuItems = [
    { name: "Live", href: "/admin/dashboard", icon: Radio, badge: "LIVE" },
    { name: "Magasins", href: "/admin/stores", icon: Store },
    { name: "Groupes", href: "/admin/groups", icon: Users },
    { name: "Styles", href: "/admin/tracks", icon: Music },
    { name: "Programmation", href: "/admin/scheduling", icon: Clock },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Activité", href: "/admin/activity", icon: Activity },
    { name: "Preview", href: "/admin/preview", icon: Eye },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className={styles.layout} data-accent="violet">
            {/* Mobile Header */}
            <header className={styles.mobileHeader}>
                <div className={styles.mobileLogoWrapper}>
                    <span className={styles.logoIcon}>A</span>
                    <span className={styles.mobileLogo}>Aura Admin</span>
                </div>
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
                <div className={styles.logoSection}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>A</span>
                        <span className={styles.logoText}>Aura Admin</span>
                    </div>
                </div>

                <nav className={styles.nav}>
                    <div className={styles.navSection}>
                        <span className={styles.navLabel}>Menu</span>
                        {menuItems.slice(0, 4).map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    styles.navItem,
                                    pathname === item.href && styles.active
                                )}
                                onClick={closeSidebar}
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                                {item.badge && (
                                    <span className={styles.badge}>{item.badge}</span>
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className={styles.navSection}>
                        <span className={styles.navLabel}>Insights</span>
                        {menuItems.slice(4).map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    styles.navItem,
                                    pathname === item.href && styles.active
                                )}
                                onClick={closeSidebar}
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className={styles.sidebarFooter}>
                    <button onClick={() => signOut()} className={styles.logout}>
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}
