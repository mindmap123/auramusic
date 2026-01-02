"use client";

import { useState, useEffect } from "react";
import Player from "@/components/Player/Player";
import styles from "./Preview.module.css";
import { Monitor, RefreshCcw } from "lucide-react";

export default function PreviewContent() {
    const [stores, setStores] = useState<any[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string>("");
    const [previewData, setPreviewData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { fetchStores(); }, []);

    const fetchStores = async () => {
        try {
            const res = await fetch("/api/admin/stores");
            const data = await res.json();
            setStores(data);
            if (data.length > 0) {
                setSelectedStoreId(data[0].id);
                loadPreview(data[0].id);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const loadPreview = async (storeId: string) => {
        setRefreshing(true);
        try {
            const res = await fetch(`/api/admin/preview/store?storeId=${storeId}`);
            setPreviewData(await res.json());
        } catch (err) { console.error(err); }
        finally { setRefreshing(false); setLoading(false); }
    };

    if (loading) return <div className={styles.loading}>Chargement...</div>;

    if (stores.length === 0) {
        return (
            <div className={styles.empty}>
                <Monitor size={48} />
                <h2>Aucun magasin</h2>
                <p>Créez d'abord un magasin.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.info}>
                    <h1 className={styles.title}>Aperçu Magasin</h1>
                    <p className={styles.subtitle}>Interface client</p>
                </div>
                <div className={styles.actions}>
                    <select value={selectedStoreId} onChange={(e) => { setSelectedStoreId(e.target.value); loadPreview(e.target.value); }} className={styles.storeSelect}>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button onClick={() => loadPreview(selectedStoreId)} className={styles.refreshBtn} disabled={refreshing}>
                        <RefreshCcw size={18} className={refreshing ? styles.spin : ""} /><span>Actualiser</span>
                    </button>
                </div>
            </header>
            <div className={styles.previewFrame}>
                {previewData && <div key={selectedStoreId} style={{ height: '100%' }}><Player store={previewData} isPreview={true} /></div>}
            </div>
        </div>
    );
}
