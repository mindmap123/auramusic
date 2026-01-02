"use client";

import { useState, useEffect } from "react";
import styles from "./Stores.module.css";
import { Plus, Search, MoreVertical, Trash2, Edit2, ShieldAlert } from "lucide-react";

export default function StoresPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newStore, setNewStore] = useState({ name: "", email: "", password: "" });

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const res = await fetch("/api/admin/stores");
            const data = await res.json();
            setStores(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/stores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStore),
            });
            if (res.ok) {
                setShowModal(false);
                setNewStore({ name: "", email: "", password: "" });
                fetchStores();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce magasin ?")) return;
        try {
            const res = await fetch(`/api/admin/stores/${id}`, { method: "DELETE" });
            if (res.ok) fetchStores();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Magasins</h1>
                <button onClick={() => setShowModal(true)} className={styles.addButton}>
                    <Plus size={20} />
                    <span>Ajouter un magasin</span>
                </button>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBar}>
                    <Search size={18} />
                    <input type="text" placeholder="Rechercher un magasin..." />
                </div>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Style Actif</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className={styles.loading}>Chargement...</td></tr>
                        ) : stores.length === 0 ? (
                            <tr><td colSpan={5} className={styles.empty}>Aucun magasin trouvé.</td></tr>
                        ) : (
                            stores.map((store: any) => (
                                <tr key={store.id}>
                                    <td><strong>{store.name}</strong></td>
                                    <td>{store.email}</td>
                                    <td><span className={styles.badgeStyle}>{store.style?.name || "Aucun"}</span></td>
                                    <td>
                                        <span className={clsx(styles.status, store.isActive ? styles.active : styles.inactive)}>
                                            {store.isActive ? "Actif" : "Inactif"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={styles.iconButton} title="Éditer"><Edit2 size={16} /></button>
                                            <button
                                                className={clsx(styles.iconButton, styles.delete)}
                                                onClick={() => handleDelete(store.id)}
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Nouveau Magasin</h2>
                        <form onSubmit={handleCreate}>
                            <div className={styles.inputGroup}>
                                <label>Nom du magasin</label>
                                <input
                                    type="text"
                                    value={newStore.name}
                                    onChange={e => setNewStore({ ...newStore, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Email de connexion</label>
                                <input
                                    type="email"
                                    value={newStore.email}
                                    onChange={e => setNewStore({ ...newStore, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Mot de passe</label>
                                <input
                                    type="password"
                                    value={newStore.password}
                                    onChange={e => setNewStore({ ...newStore, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelButton}>Annuler</button>
                                <button type="submit" className={styles.saveButton}>Créer le magasin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Minimal clsx helper since I used it above
function clsx(...args: any[]) {
    return args.filter(Boolean).join(" ");
}
