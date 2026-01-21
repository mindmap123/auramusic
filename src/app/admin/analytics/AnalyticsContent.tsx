"use client";

import { useState, useEffect } from "react";
import styles from "./Analytics.module.css";
import { Clock, Store, Music, Trophy, TrendingUp, Users } from "lucide-react";
import { clsx } from "clsx";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from "recharts";

interface KPIs {
    totalHours: number;
    totalSessions: number;
    activeStores: number;
    totalStores: number;
    topStyle: string;
}

interface DailyStat {
    date: string;
    hours: number;
    [key: string]: string | number;
}

interface StyleDist {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number;
}

interface StoreStat {
    name: string;
    hours: number;
    sessions: number;
    favoriteStyle: string;
}

interface AnalyticsData {
    kpis: KPIs;
    dailyStats: DailyStat[];
    styleDistribution: StyleDist[];
    storeStats: StoreStat[];
    topStores: StoreStat[];
}

const COLORS = ['#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px 16px',
            }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
                    {payload[0].value}h d'écoute
                </p>
            </div>
        );
    }
    return null;
};

export default function AnalyticsContent() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/analytics")
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className={styles.loading}>Chargement des statistiques...</div>;
    }

    if (!data) {
        return <div className={styles.emptyState}>Erreur lors du chargement des données</div>;
    }

    const maxHours = Math.max(...data.storeStats.map(s => s.hours), 1);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Analytics</h1>
                    <p className={styles.subtitle}>Vue d'ensemble de l'activité de la plateforme</p>
                </div>
            </div>

            {/* KPIs */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={clsx(styles.kpiIcon, styles.purple)}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <div className={styles.kpiLabel}>Heures d'écoute</div>
                        <div className={styles.kpiValue}>{data.kpis.totalHours}h</div>
                        <div className={styles.kpiSub}>Total cumulé</div>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={clsx(styles.kpiIcon, styles.blue)}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <div className={styles.kpiLabel}>Sessions</div>
                        <div className={styles.kpiValue}>{data.kpis.totalSessions}</div>
                        <div className={styles.kpiSub}>Sessions de lecture</div>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={clsx(styles.kpiIcon, styles.green)}>
                        <Store size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <div className={styles.kpiLabel}>Magasins actifs</div>
                        <div className={styles.kpiValue}>{data.kpis.activeStores}/{data.kpis.totalStores}</div>
                        <div className={styles.kpiSub}>Ont écouté de la musique</div>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={clsx(styles.kpiIcon, styles.orange)}>
                        <Trophy size={24} />
                    </div>
                    <div className={styles.kpiContent}>
                        <div className={styles.kpiLabel}>Style préféré</div>
                        <div className={styles.kpiValue} style={{ fontSize: '1.25rem' }}>{data.kpis.topStyle}</div>
                        <div className={styles.kpiSub}>Le plus écouté</div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className={styles.chartsGrid}>
                {/* Line chart - Daily listening */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <div>
                            <h3 className={styles.chartTitle}>Écoute quotidienne</h3>
                            <p className={styles.chartSubtitle}>7 derniers jours</p>
                        </div>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.dailyStats}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}h`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="hours"
                                    stroke="#a855f7"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorHours)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie chart - Style distribution */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <div>
                            <h3 className={styles.chartTitle}>Par style</h3>
                            <p className={styles.chartSubtitle}>Répartition des heures</p>
                        </div>
                    </div>
                    {data.styleDistribution.length > 0 ? (
                        <>
                            <div className={styles.pieChartContainer}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={data.styleDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {data.styleDistribution.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color || COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`${value}h`, 'Heures']}
                                            contentStyle={{
                                                background: 'rgba(15, 23, 42, 0.95)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className={styles.legend}>
                                {data.styleDistribution.slice(0, 5).map((style, index) => (
                                    <div key={style.name} className={styles.legendItem}>
                                        <div
                                            className={styles.legendDot}
                                            style={{ backgroundColor: style.color || COLORS[index % COLORS.length] }}
                                        />
                                        <span className={styles.legendLabel}>{style.name}</span>
                                        <span className={styles.legendValue}>{style.value}h</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>Aucune donnée</div>
                    )}
                </div>
            </div>

            {/* Stores table */}
            <div className={styles.storesSection}>
                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <h3 className={styles.tableTitle}>Performance par magasin</h3>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Magasin</th>
                                <th>Heures</th>
                                <th className={styles.progressCell}>Progression</th>
                                <th>Sessions</th>
                                <th>Style favori</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.storeStats.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>
                                        Aucune donnée disponible
                                    </td>
                                </tr>
                            ) : (
                                data.storeStats.map((store) => (
                                    <tr key={store.name}>
                                        <td>
                                            <span className={styles.storeName}>{store.name}</span>
                                        </td>
                                        <td>{store.hours}h</td>
                                        <td className={styles.progressCell}>
                                            <div className={styles.progressWrapper}>
                                                <div className={styles.progressBar}>
                                                    <div
                                                        className={styles.progressFill}
                                                        style={{ width: `${(store.hours / maxHours) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>{store.sessions}</td>
                                        <td>
                                            <span className={styles.styleBadge}>{store.favoriteStyle}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
