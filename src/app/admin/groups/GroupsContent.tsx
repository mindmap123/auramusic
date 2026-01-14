"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Store,
    Music,
    ChevronDown,
    ChevronRight,
    X,
} from "lucide-react";
import { clsx } from "clsx";
import styles from "./Groups.module.css";

interface StoreInfo {
    id: string;
    name: string;
    isActive: boolean;
    isPlaying: boolean;
    city: string | null;
}

interface Group {
    id: string;
    name: string;
    description: string | null;
    color: string;
    defaultStyleId: string | null;
    defaultVolume: number;
    _count: { stores: number };
    stores: StoreInfo[];
}

interface Style {
    id: string;
    name: string;
    icon: string | null;
}

export default function GroupsContent() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [musicStyles, setMusicStyles] = useState<Style[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: "#1db954",
        defaultStyleId: "",
        defaultVolume: 70,
    });

    useEffect(() => {
        fetchGroups();
        fetchStyles();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch("/api/admin/groups");
            const data = await res.json();
            setGroups(data);
        } catch (error) {
            console.error("Failed to fetch groups:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStyles = async () => {
        try {
            const res = await fetch("/api/styles");
            const data = await res.json();
            setMusicStyles(data);
        } catch (error) {
            console.error("Failed to fetch styles:", error);
        }
    };

    const toggleExpand = (groupId: string) => {
        setExpandedGroups((prev) =>
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : [...prev, groupId]
        );
    };

    const openCreateModal = () => {
        setEditingGroup(null);
        setFormData({
            name: "",
            description: "",
            color: "#1db954",
            defaultStyleId: "",
            defaultVolume: 70,
        });
        setShowModal(true);
    };

    const openEditModal = (group: Group) => {
        setEditingGroup(group);
        setFormData({
            name: group.name,
            description: group.description || "",
            color: group.color,
            defaultStyleId: group.defaultStyleId || "",
            defaultVolume: group.defaultVolume,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingGroup
                ? `/api/admin/groups/${editingGroup.id}`
                : "/api/admin/groups";
            const method = editingGroup ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    defaultStyleId: formData.defaultStyleId || null,
                }),
            });

            if (res.ok) {
                setShowModal(false);
                fetchGroups();
            }
        } catch (error) {
            console.error("Failed to save group:", error);
        }
    };

    const handleDelete = async (groupId: string) => {
        if (!confirm("Supprimer ce groupe ? Les magasins ne seront pas supprimés.")) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/groups/${groupId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchGroups();
            }
        } catch (error) {
            console.error("Failed to delete group:", error);
        }
    };

    const colorPresets = [
        "#1db954", "#3b82f6", "#8b5cf6", "#ec4899",
        "#f97316", "#ef4444", "#06b6d4", "#84cc16",
    ];

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <p>Chargement des groupes...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Groupes de magasins</h1>
                    <p className={styles.subtitle}>
                        Organisez vos magasins par enseigne ou région
                    </p>
                </div>
                <button className={styles.createBtn} onClick={openCreateModal}>
                    <Plus size={20} />
                    Nouveau groupe
                </button>
            </div>

            {/* Groups List */}
            {groups.length === 0 ? (
                <div className={styles.emptyState}>
                    <Users size={48} />
                    <h3>Aucun groupe</h3>
                    <p>Créez votre premier groupe pour organiser vos magasins</p>
                    <button className={styles.createBtn} onClick={openCreateModal}>
                        <Plus size={20} />
                        Créer un groupe
                    </button>
                </div>
            ) : (
                <div className={styles.groupsList}>
                    {groups.map((group) => {
                        const isExpanded = expandedGroups.includes(group.id);
                        const activeStores = group.stores.filter((s) => s.isActive).length;
                        const playingStores = group.stores.filter((s) => s.isPlaying).length;

                        return (
                            <div key={group.id} className={styles.groupCard}>
                                <div
                                    className={styles.groupHeader}
                                    onClick={() => toggleExpand(group.id)}
                                >
                                    <div className={styles.groupInfo}>
                                        <div
                                            className={styles.groupColor}
                                            style={{ background: group.color }}
                                        />
                                        <div className={styles.groupDetails}>
                                            <h3 className={styles.groupName}>{group.name}</h3>
                                            {group.description && (
                                                <p className={styles.groupDesc}>{group.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.groupStats}>
                                        <span className={styles.stat}>
                                            <Store size={14} />
                                            {group._count.stores} magasins
                                        </span>
                                        {playingStores > 0 && (
                                            <span className={clsx(styles.stat, styles.playing)}>
                                                <Music size={14} />
                                                {playingStores} en lecture
                                            </span>
                                        )}
                                    </div>

                                    <div className={styles.groupActions}>
                                        <button
                                            className={styles.iconBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditModal(group);
                                            }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className={clsx(styles.iconBtn, styles.danger)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(group.id);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        {isExpanded ? (
                                            <ChevronDown size={20} />
                                        ) : (
                                            <ChevronRight size={20} />
                                        )}
                                    </div>
                                </div>

                                {isExpanded && group.stores.length > 0 && (
                                    <div className={styles.storesList}>
                                        {group.stores.map((store) => (
                                            <div
                                                key={store.id}
                                                className={clsx(
                                                    styles.storeItem,
                                                    store.isPlaying && styles.playing
                                                )}
                                            >
                                                <span className={styles.storeName}>{store.name}</span>
                                                {store.city && (
                                                    <span className={styles.storeCity}>{store.city}</span>
                                                )}
                                                <span
                                                    className={clsx(
                                                        styles.storeStatus,
                                                        store.isPlaying && styles.active
                                                    )}
                                                >
                                                    {store.isPlaying ? "En lecture" : store.isActive ? "Actif" : "Inactif"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isExpanded && group.stores.length === 0 && (
                                    <div className={styles.emptyStores}>
                                        Aucun magasin dans ce groupe
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingGroup ? "Modifier le groupe" : "Nouveau groupe"}</h2>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setShowModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Nom du groupe</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="Ex: Starbucks France"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description (optionnel)</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Ex: Tous les cafés Starbucks en France"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Couleur</label>
                                <div className={styles.colorPicker}>
                                    {colorPresets.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={clsx(
                                                styles.colorOption,
                                                formData.color === color && styles.selected
                                            )}
                                            style={{ background: color }}
                                            onClick={() => setFormData({ ...formData, color })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Style par défaut</label>
                                <select
                                    value={formData.defaultStyleId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, defaultStyleId: e.target.value })
                                    }
                                >
                                    <option value="">Aucun</option>
                                    {musicStyles.map((style) => (
                                        <option key={style.id} value={style.id}>
                                            {style.icon} {style.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Volume par défaut: {formData.defaultVolume}%</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={formData.defaultVolume}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            defaultVolume: parseInt(e.target.value),
                                        })
                                    }
                                    className={styles.volumeSlider}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setShowModal(false)}
                                >
                                    Annuler
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    {editingGroup ? "Enregistrer" : "Créer le groupe"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
