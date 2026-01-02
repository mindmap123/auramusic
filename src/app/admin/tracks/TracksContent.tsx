"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Tracks.module.css";
import { Plus, Upload, CheckCircle, XCircle, Trash2, Edit2, Play, X, Volume2, Image } from "lucide-react";
import { clsx } from "clsx";

export default function TracksContent() {
    const [stylesList, setStylesList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Upload mix modal
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [selectedStyleId, setSelectedStyleId] = useState("");
    
    // Style modal (create/edit)
    const [showStyleModal, setShowStyleModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [styleFormData, setStyleFormData] = useState({
        name: "",
        slug: "",
        description: "",
        icon: "🎵",
        colorTheme: "#a855f7",
        coverUrl: "" as string | null
    });
    const coverInputRef = useRef<HTMLInputElement>(null);
    
    // Audio
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [audio] = useState(() => typeof window !== 'undefined' ? new Audio() : null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        fetchStyles();
        return () => { if (audio) { audio.pause(); audio.src = ''; } };
    }, []);

    const fetchStyles = async () => {
        try {
            const res = await fetch("/api/styles");
            setStylesList(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleUploadMix = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStyleId || !file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("styleId", selectedStyleId);

        try {
            const res = await fetch("/api/admin/mixes", { method: "POST", body: formData });
            if (res.ok) {
                setShowUpload(false);
                setFile(null);
                fetchStyles();
            } else {
                alert((await res.json()).error || "Erreur");
            }
        } catch (err: any) { alert("Erreur : " + err.message); }
        finally { setUploading(false); }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedStyleId) return;

        setUploadingCover(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("styleId", selectedStyleId);

        try {
            const res = await fetch("/api/admin/covers", { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok) {
                setStyleFormData(prev => ({ ...prev, coverUrl: data.url }));
                fetchStyles();
            } else {
                alert(data.error || "Erreur upload");
            }
        } catch (err) { alert("Erreur upload"); }
        finally { setUploadingCover(false); }
    };

    const handleDeleteCover = async () => {
        if (!selectedStyleId) return;
        try {
            await fetch(`/api/admin/styles/${selectedStyleId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ coverUrl: null }),
            });
            setStyleFormData(prev => ({ ...prev, coverUrl: null }));
            fetchStyles();
        } catch (err) { console.error(err); }
    };

    const handleStyleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const isEditing = !!selectedStyleId;
            const { coverUrl, ...dataToSend } = styleFormData; // Don't send coverUrl in this request
            const res = await fetch(isEditing ? `/api/admin/styles/${selectedStyleId}` : "/api/admin/styles", {
                method: isEditing ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });

            if (res.ok) {
                setShowStyleModal(false);
                resetStyleForm();
                fetchStyles();
            } else {
                alert((await res.json()).error || "Erreur");
            }
        } catch (err) { alert("Erreur"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string, name: string, type: "style" | "mix") => {
        if (!confirm(type === "style" ? `Supprimer "${name}" ?` : `Supprimer le mix de "${name}" ?`)) return;
        try {
            if (type === "style") {
                await fetch(`/api/admin/styles/${id}`, { method: "DELETE" });
            } else {
                await fetch(`/api/admin/styles/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mixUrl: null }),
                });
            }
            fetchStyles();
        } catch (err) { console.error(err); }
    };

    const handlePlay = (style: any) => {
        if (!audio || !style.mixUrl) return;
        if (playingId === style.id) { audio.pause(); setPlayingId(null); }
        else { audio.src = style.mixUrl; audio.play(); setPlayingId(style.id); audio.onended = () => setPlayingId(null); }
    };

    const resetStyleForm = () => {
        setSelectedStyleId("");
        setStyleFormData({ name: "", slug: "", description: "", icon: "🎵", colorTheme: "#a855f7", coverUrl: null });
    };

    const openEditModal = (style: any) => {
        setSelectedStyleId(style.id);
        setStyleFormData({
            name: style.name,
            slug: style.slug,
            description: style.description,
            icon: style.icon || "🎵",
            colorTheme: style.colorTheme || "#a855f7",
            coverUrl: style.coverUrl || null
        });
        setShowStyleModal(true);
    };

    const generateSlug = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Radios & Mixes</h1>
                    <p className={styles.subtitle}>{stylesList.length} style{stylesList.length > 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => { resetStyleForm(); setShowStyleModal(true); }} className="btn-primary">
                    <Plus size={18} /><span>Nouveau style</span>
                </button>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Style</th>
                            <th>Mix audio</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} className={styles.loading}>Chargement...</td></tr>
                        ) : stylesList.length === 0 ? (
                            <tr><td colSpan={3} className={styles.empty}>Aucun style</td></tr>
                        ) : (
                            stylesList.map((style) => (
                                <tr key={style.id}>
                                    <td>
                                        <div className={styles.styleCell}>
                                            {style.coverUrl ? (
                                                <img src={style.coverUrl} alt="" className={styles.styleCover} />
                                            ) : (
                                                <span className={styles.styleIcon}>{style.icon}</span>
                                            )}
                                            <div className={styles.styleInfo}>
                                                <span className={styles.styleName}>{style.name}</span>
                                                <span className={styles.styleDesc}>{style.description}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {style.mixUrl ? (
                                            <div className={styles.mixStatus}>
                                                <span className={styles.statusActive}><CheckCircle size={14} /> Configuré</span>
                                                <button onClick={() => handleDelete(style.id, style.name, "mix")} className={styles.deleteMixBtn}><Trash2 size={14} /></button>
                                            </div>
                                        ) : (
                                            <span className={styles.statusInactive}><XCircle size={14} /> Manquant</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            {style.mixUrl && (
                                                <button onClick={() => handlePlay(style)} className={clsx(styles.actionBtn, playingId === style.id && styles.playing)} title="Écouter">
                                                    {playingId === style.id ? <Volume2 size={16} /> : <Play size={16} />}
                                                </button>
                                            )}
                                            <button onClick={() => { setSelectedStyleId(style.id); setFile(null); setShowUpload(true); }} className={styles.actionBtn} title="Upload mix">
                                                <Upload size={16} />
                                            </button>
                                            <button onClick={() => openEditModal(style)} className={styles.actionBtn} title="Modifier">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(style.id, style.name, "style")} className={clsx(styles.actionBtn, styles.deleteBtn)} title="Supprimer">
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

            {/* Upload Mix Modal */}
            {showUpload && (
                <div className={styles.modalOverlay} onClick={() => setShowUpload(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Uploader un mix</h2>
                            <button onClick={() => setShowUpload(false)} className={styles.closeBtn}><X size={20} /></button>
                        </div>
                        <p className={styles.modalSubtitle}>Style : <strong>{stylesList.find(s => s.id === selectedStyleId)?.name}</strong></p>
                        <form onSubmit={handleUploadMix}>
                            <div className={clsx(styles.dropzone, isDragging && styles.dragging, file && styles.hasFile)}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => { e.preventDefault(); setIsDragging(false); setFile(e.dataTransfer.files[0] || null); }}>
                                <input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} id="file-input" />
                                <label htmlFor="file-input">
                                    <Upload size={32} />
                                    {file ? <span>{file.name}</span> : <span>Fichier MP3</span>}
                                </label>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowUpload(false)} className="btn-secondary">Annuler</button>
                                <button type="submit" className="btn-primary" disabled={uploading || !file}>{uploading ? "Upload..." : "Uploader"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Style Modal (Create/Edit) */}
            {showStyleModal && (
                <div className={styles.modalOverlay} onClick={() => setShowStyleModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{selectedStyleId ? "Modifier le style" : "Nouveau style"}</h2>
                            <button onClick={() => setShowStyleModal(false)} className={styles.closeBtn}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleStyleSubmit}>
                            {/* Cover Upload Section */}
                            {selectedStyleId && (
                                <div className={styles.coverSection}>
                                    <label>Pochette</label>
                                    <div className={styles.coverUpload}>
                                        {styleFormData.coverUrl ? (
                                            <div className={styles.coverPreview}>
                                                <img src={styleFormData.coverUrl} alt="Cover" />
                                                <button type="button" onClick={handleDeleteCover} className={styles.coverDeleteBtn}><Trash2 size={14} /></button>
                                            </div>
                                        ) : (
                                            <div className={styles.coverPlaceholder} onClick={() => coverInputRef.current?.click()}>
                                                <Image size={24} />
                                                <span>{uploadingCover ? "Upload..." : "Ajouter"}</span>
                                            </div>
                                        )}
                                        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
                                        {styleFormData.coverUrl && (
                                            <button type="button" onClick={() => coverInputRef.current?.click()} className={styles.changeCoverBtn}>
                                                {uploadingCover ? "Upload..." : "Changer"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Nom</label>
                                    <input type="text" className="input" value={styleFormData.name} onChange={e => setStyleFormData({ ...styleFormData, name: e.target.value, slug: selectedStyleId ? styleFormData.slug : generateSlug(e.target.value) })} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Slug</label>
                                    <input type="text" className="input" value={styleFormData.slug} onChange={e => setStyleFormData({ ...styleFormData, slug: e.target.value })} disabled={!!selectedStyleId} required />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea className="input" value={styleFormData.description} onChange={e => setStyleFormData({ ...styleFormData, description: e.target.value })} rows={3} required />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Icône (emoji)</label>
                                    <input type="text" className="input" value={styleFormData.icon} onChange={e => setStyleFormData({ ...styleFormData, icon: e.target.value })} maxLength={8} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Couleur</label>
                                    <div className={styles.colorInput}>
                                        <input type="color" value={styleFormData.colorTheme} onChange={e => setStyleFormData({ ...styleFormData, colorTheme: e.target.value })} />
                                        <span>{styleFormData.colorTheme}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowStyleModal(false)} className="btn-secondary">Annuler</button>
                                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "..." : selectedStyleId ? "Enregistrer" : "Créer"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
