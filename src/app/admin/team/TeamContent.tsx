"use client";

import { useState, useEffect } from "react";
import styles from "./Team.module.css";
import { Plus, Search, Trash2, Edit2, X, Eye, EyeOff, Store, Users } from "lucide-react";
import { clsx } from "clsx";

type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "EDITOR" | "VIEWER";

interface StoreAccess {
    storeId: string;
    store: { id: string; name: string; city?: string | null };
    canEdit: boolean;
    canPlay: boolean;
    canSchedule: boolean;
}

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    storeAccess: StoreAccess[];
}

interface StoreOption {
    id: string;
    name: string;
    city?: string | null;
}

interface FormStoreAccess {
    storeId: string;
    canEdit: boolean;
    canPlay: boolean;
    canSchedule: boolean;
}

const ROLES: { value: UserRole; label: string; desc: string }[] = [
    { value: "ADMIN", label: "Admin", desc: "Accès complet à l'administration" },
    { value: "MANAGER", label: "Manager", desc: "Gère les magasins assignés" },
    { value: "EDITOR", label: "Éditeur", desc: "Modifie styles et playlists" },
    { value: "VIEWER", label: "Lecteur", desc: "Consultation uniquement" },
];

const getRoleBadgeClass = (role: UserRole) => {
    const classes: Record<UserRole, string> = {
        OWNER: styles.roleOwner,
        ADMIN: styles.roleAdmin,
        MANAGER: styles.roleManager,
        EDITOR: styles.roleEditor,
        VIEWER: styles.roleViewer,
    };
    return classes[role];
};

const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
        OWNER: "Propriétaire",
        ADMIN: "Admin",
        MANAGER: "Manager",
        EDITOR: "Éditeur",
        VIEWER: "Lecteur",
    };
    return labels[role];
};

export default function TeamContent() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [stores, setStores] = useState<StoreOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "VIEWER" as UserRole,
    });
    const [formStoreAccess, setFormStoreAccess] = useState<FormStoreAccess[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchMembers();
        fetchStores();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await fetch("/api/admin/team");
            if (res.ok) setMembers(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStores = async () => {
        try {
            const res = await fetch("/api/admin/stores");
            if (res.ok) {
                const data = await res.json();
                setStores(data.map((s: any) => ({ id: s.id, name: s.name, city: s.city })));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openCreateModal = () => {
        setEditingMember(null);
        setFormData({ name: "", email: "", password: "", role: "VIEWER" });
        setFormStoreAccess([]);
        setError("");
        setShowModal(true);
    };

    const openEditModal = (member: TeamMember) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            email: member.email,
            password: "",
            role: member.role,
        });
        setFormStoreAccess(
            member.storeAccess.map((sa) => ({
                storeId: sa.storeId,
                canEdit: sa.canEdit,
                canPlay: sa.canPlay,
                canSchedule: sa.canSchedule,
            }))
        );
        setError("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingMember(null);
        setFormData({ name: "", email: "", password: "", role: "VIEWER" });
        setFormStoreAccess([]);
    };

    const toggleStoreAccess = (storeId: string) => {
        const existing = formStoreAccess.find((sa) => sa.storeId === storeId);
        if (existing) {
            setFormStoreAccess(formStoreAccess.filter((sa) => sa.storeId !== storeId));
        } else {
            setFormStoreAccess([
                ...formStoreAccess,
                { storeId, canEdit: false, canPlay: true, canSchedule: false },
            ]);
        }
    };

    const updateStorePermission = (
        storeId: string,
        perm: "canEdit" | "canPlay" | "canSchedule",
        value: boolean
    ) => {
        setFormStoreAccess(
            formStoreAccess.map((sa) =>
                sa.storeId === storeId ? { ...sa, [perm]: value } : sa
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const payload: any = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                storeAccess: formStoreAccess,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            if (editingMember) {
                const res = await fetch(`/api/admin/team/${editingMember.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error((await res.json()).error || "Erreur");
            } else {
                if (!formData.password) throw new Error("Mot de passe requis");
                payload.password = formData.password;
                const res = await fetch("/api/admin/team", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error((await res.json()).error || "Erreur");
            }

            closeModal();
            fetchMembers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Supprimer "${name}" de l'équipe ?`)) return;
        await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
        fetchMembers();
    };

    const handleToggleActive = async (member: TeamMember) => {
        await fetch(`/api/admin/team/${member.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !member.isActive }),
        });
        fetchMembers();
    };

    const filteredMembers = members.filter(
        (m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatLastLogin = (date: string | null) => {
        if (!date) return "Jamais";
        return new Date(date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Équipe</h1>
                    <p className={styles.subtitle}>
                        {members.length} membre{members.length > 1 ? "s" : ""}
                    </p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <Plus size={18} />
                    <span>Inviter</span>
                </button>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBar}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un membre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Membre</th>
                            <th>Rôle</th>
                            <th>Magasins</th>
                            <th>Dernière connexion</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className={styles.loading}>
                                    Chargement...
                                </td>
                            </tr>
                        ) : filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={styles.empty}>
                                    Aucun membre dans l'équipe
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((member) => (
                                <tr key={member.id}>
                                    <td>
                                        <div>
                                            <span className={styles.userName}>{member.name}</span>
                                            <div className={styles.userEmail}>{member.email}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={clsx(styles.roleBadge, getRoleBadgeClass(member.role))}>
                                            {getRoleLabel(member.role)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.storesCount}>
                                            <Store />
                                            {member.role === "ADMIN" || member.role === "OWNER"
                                                ? "Tous"
                                                : member.storeAccess.length}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.lastLogin}>
                                            {formatLastLogin(member.lastLoginAt)}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleActive(member)}
                                            className={clsx(
                                                styles.statusBadge,
                                                member.isActive ? styles.active : styles.inactive
                                            )}
                                            disabled={member.role === "OWNER"}
                                        >
                                            {member.isActive ? "Actif" : "Inactif"}
                                        </button>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                onClick={() => openEditModal(member)}
                                                className={styles.actionBtn}
                                                title="Modifier"
                                                disabled={member.role === "OWNER"}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id, member.name)}
                                                className={clsx(styles.actionBtn, styles.deleteBtn)}
                                                title="Supprimer"
                                                disabled={member.role === "OWNER"}
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
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingMember ? "Modifier le membre" : "Inviter un membre"}</h2>
                            <button onClick={closeModal} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {error && <div className={styles.error}>{error}</div>}

                            <div className={styles.formGroup}>
                                <label>Nom</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>
                                    {editingMember ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
                                </label>
                                <div className={styles.passwordInput}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="input"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingMember}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={styles.passwordToggle}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Rôle</label>
                                <div className={styles.roleSelector}>
                                    {ROLES.map((role) => (
                                        <button
                                            key={role.value}
                                            type="button"
                                            className={clsx(
                                                styles.roleOption,
                                                formData.role === role.value && styles.selected
                                            )}
                                            onClick={() => setFormData({ ...formData, role: role.value })}
                                        >
                                            <span className={styles.roleName}>{role.label}</span>
                                            <span className={styles.roleDesc}>{role.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.role !== "ADMIN" && (
                                <div className={styles.storeAccessSection}>
                                    <h3>Accès aux magasins</h3>
                                    <div className={styles.storeList}>
                                        {stores.map((store) => {
                                            const access = formStoreAccess.find((sa) => sa.storeId === store.id);
                                            const isSelected = !!access;

                                            return (
                                                <div key={store.id} className={styles.storeItem}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleStoreAccess(store.id)}
                                                        />
                                                        <div>
                                                            <span className={styles.storeItemName}>{store.name}</span>
                                                            {store.city && (
                                                                <span className={styles.storeItemCity}> - {store.city}</span>
                                                            )}
                                                        </div>
                                                    </label>
                                                    {isSelected && (
                                                        <div className={styles.permissionToggles}>
                                                            <label
                                                                className={clsx(styles.permToggle, access.canEdit && styles.active)}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={access.canEdit}
                                                                    onChange={(e) =>
                                                                        updateStorePermission(store.id, "canEdit", e.target.checked)
                                                                    }
                                                                />
                                                                Éditer
                                                            </label>
                                                            <label
                                                                className={clsx(styles.permToggle, access.canSchedule && styles.active)}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={access.canSchedule}
                                                                    onChange={(e) =>
                                                                        updateStorePermission(store.id, "canSchedule", e.target.checked)
                                                                    }
                                                                />
                                                                Programmer
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className={styles.modalActions}>
                                <button type="button" onClick={closeModal} className="btn-secondary">
                                    Annuler
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? "..." : editingMember ? "Enregistrer" : "Inviter"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
