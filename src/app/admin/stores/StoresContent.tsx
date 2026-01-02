"use client";

import { useState, useEffect } from "react";
import styles from "./Stores.module.css";
import { Plus, Search, Trash2, Edit2, X, Eye, EyeOff } from "lucide-react";
import { clsx } from "clsx";

interface Store {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    style?: { name: string } | null;
    createdAt: string;
}

interface StoreForm {
    name: string;
    email: string;
    password: string;
}

export default function StoresContent() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [formData, setFormData] = useState<StoreForm>({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { fetchStores(); }, []);

    const fetchStores = async () => {
        try {
            const res = await fetch("/api/admin/stores");
            setStores(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openCreateModal = () => {
        setEditingStore(null);
        setFormData({ name: "", email: "", password: "" });
        setError("");
        setShowModal(true);
    };

    const openEditModal = (store: Store) => {
        setEditingStore(store);
        setFormData({ name: store.name, email: store.email, password: "" });
        setError("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingStore(null);
        setFormData({ name: "", email: "", password: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            if (editingStore) {
                const updateData: any = { name: formData.name, email: formData.email };
                if (formData.password) updateData.password = formData.password;
                const res = await fetch(`/api/admin/stores/${editingStore.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updateData),
                });
                if (!res.ok) throw new Error((await res.json()).error || "Erreur");
            } else {
                if (!formData.password) throw new Error("Mot de passe requis");
                const res = await fetch("/api/admin/stores", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error((await res.json()).error || "Erreur");
            }
            closeModal();
            fetchStores();
        } catch (err: any) { setError(err.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Supprimer "${name}" ?`)) return;
        await fetch(`/api/admin/stores/${id}`, { method: "DELETE" });
        fetchStores();
    };

    const handleToggleActive = async (store: Store) => {
        await fetch(`/api/admin/stores/${store.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !store.isActive }),
        });
        fetchStores();
    };

    const filteredStores = stores.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Magasins</h1>
                    <p className={styles.subtitle}>{stores.length} magasin{stores.length > 1 ? 's' : ''}</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <Plus size={18} /><span>Nouveau</span>
                </button>
            </div>
            <div className={styles.filters}>
                <div className={styles.searchBar}>
                    <Search size={18} />
                    <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
            </div>
            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead><tr><th>Magasin</th><th>Email</th><th>Style</th><th>Statut</th><th>Actions</th></tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan={5} className={styles.loading}>Chargement...</td></tr>
                        : filteredStores.length === 0 ? <tr><td colSpan={5} className={styles.empty}>Aucun magasin</td></tr>
                        : filteredStores.map(store => (
                            <tr key={store.id}>
                                <td><span className={styles.storeName}>{store.name}</span></td>
                                <td className={styles.email}>{store.email}</td>
                                <td><span className={styles.styleBadge}>{store.style?.name || "Aucun"}</span></td>
                                <td>
                                    <button onClick={() => handleToggleActive(store)} className={clsx(styles.statusBadge, store.isActive ? styles.active : styles.inactive)}>
                                        {store.isActive ? "Actif" : "Inactif"}
                                    </button>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button onClick={() => openEditModal(store)} className={styles.actionBtn} title="Modifier"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(store.id, store.name)} className={clsx(styles.actionBtn, styles.deleteBtn)} title="Supprimer"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingStore ? "Modifier" : "Nouveau magasin"}</h2>
                            <button onClick={closeModal} className={styles.closeBtn}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {error && <div className={styles.error}>{error}</div>}
                            <div className={styles.formGroup}>
                                <label>Nom</label>
                                <input type="text" className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{editingStore ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}</label>
                                <div className={styles.passwordInput}>
                                    <input type={showPassword ? "text" : "password"} className="input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingStore} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggle}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={closeModal} className="btn-secondary">Annuler</button>
                                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "..." : editingStore ? "Enregistrer" : "Créer"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
