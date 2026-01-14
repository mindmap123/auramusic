"use client";

import { useState } from "react";
import styles from "./BannerPositionEditor.module.css";

interface BannerPositionEditorProps {
    styleId: string;
    styleName: string;
    coverUrl: string;
    currentHorizontal?: string;
    currentVertical?: string;
    onSave: (horizontal: string, vertical: string) => void;
}

export default function BannerPositionEditor({
    styleId,
    styleName,
    coverUrl,
    currentHorizontal = "center",
    currentVertical = "center",
    onSave
}: BannerPositionEditorProps) {
    const [horizontal, setHorizontal] = useState(currentHorizontal);
    const [vertical, setVertical] = useState(currentVertical);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(horizontal, vertical);
        } finally {
            setSaving(false);
        }
    };

    // Convertir les positions en pourcentages CSS
    const getObjectPosition = () => {
        const horizontalMap = { left: "0%", center: "50%", right: "100%" };
        const verticalMap = { top: "0%", center: "50%", bottom: "100%" };
        return `${horizontalMap[horizontal as keyof typeof horizontalMap]} ${verticalMap[vertical as keyof typeof verticalMap]}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Position du bandeau - {styleName}</h3>
                <p>Ajustez comment l'image carrée est cadrée dans le bandeau</p>
            </div>

            {/* Preview */}
            <div className={styles.preview}>
                <div className={styles.bannerPreview}>
                    <img 
                        src={coverUrl} 
                        alt={styleName}
                        style={{ objectPosition: getObjectPosition() }}
                    />
                    <div className={styles.overlay}>
                        <div className={styles.textPreview}>
                            <span className={styles.label}>EN LECTURE</span>
                            <h2>{styleName}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.controlGroup}>
                    <label>Position horizontale</label>
                    <div className={styles.buttonGroup}>
                        {[
                            { value: 'left', label: 'Gauche' },
                            { value: 'center', label: 'Centre' },
                            { value: 'right', label: 'Droite' }
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                className={`${styles.positionBtn} ${horizontal === value ? styles.active : ''}`}
                                onClick={() => setHorizontal(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.controlGroup}>
                    <label>Position verticale</label>
                    <div className={styles.buttonGroup}>
                        {[
                            { value: 'top', label: 'Haut' },
                            { value: 'center', label: 'Centre' },
                            { value: 'bottom', label: 'Bas' }
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                className={`${styles.positionBtn} ${vertical === value ? styles.active : ''}`}
                                onClick={() => setVertical(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className={styles.saveBtn}
                >
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
            </div>
        </div>
    );
}