"use client";

import { useState, useRef } from "react";
import styles from "./BannerGenerator.module.css";

interface BannerGeneratorProps {
    onBannerGenerated?: (bannerUrl: string) => void;
    defaultWidth?: number;
    defaultHeight?: number;
}

export default function BannerGenerator({ 
    onBannerGenerated, 
    defaultWidth = 800, 
    defaultHeight = 280 
}: BannerGeneratorProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [bannerUrl, setBannerUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [horizontal, setHorizontal] = useState<'left' | 'center' | 'right'>('center');
    const [vertical, setVertical] = useState<'top' | 'center' | 'bottom'>('center');
    const [dimensions, setDimensions] = useState({ width: defaultWidth, height: defaultHeight });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setBannerUrl(""); // Reset banner
        }
    };

    const generateBanner = async () => {
        if (!selectedFile) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('horizontal', horizontal);
            formData.append('vertical', vertical);
            formData.append('width', dimensions.width.toString());
            formData.append('height', dimensions.height.toString());

            const response = await fetch('/api/images/banner', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setBannerUrl(url);
                onBannerGenerated?.(url);
            } else {
                console.error('Failed to generate banner');
            }
        } catch (error) {
            console.error('Error generating banner:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadBanner = () => {
        if (bannerUrl) {
            const a = document.createElement('a');
            a.href = bannerUrl;
            a.download = `banner-${dimensions.width}x${dimensions.height}.jpg`;
            a.click();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Générateur de Bannière</h3>
                <p>Convertissez une image carrée en bannière paysage</p>
            </div>

            {/* Upload */}
            <div className={styles.uploadSection}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className={styles.hiddenInput}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.uploadBtn}
                >
                    Choisir une image carrée
                </button>
            </div>

            {previewUrl && (
                <>
                    {/* Preview */}
                    <div className={styles.previewSection}>
                        <h4>Image source</h4>
                        <img src={previewUrl} alt="Preview" className={styles.sourceImage} />
                    </div>

                    {/* Controls */}
                    <div className={styles.controls}>
                        <div className={styles.controlGroup}>
                            <label>Dimensions</label>
                            <div className={styles.dimensionInputs}>
                                <input
                                    type="number"
                                    value={dimensions.width}
                                    onChange={(e) => setDimensions(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                                    placeholder="Largeur"
                                />
                                <span>×</span>
                                <input
                                    type="number"
                                    value={dimensions.height}
                                    onChange={(e) => setDimensions(prev => ({ ...prev, height: parseInt(e.target.value) || 280 }))}
                                    placeholder="Hauteur"
                                />
                            </div>
                        </div>

                        <div className={styles.controlGroup}>
                            <label>Position horizontale</label>
                            <div className={styles.radioGroup}>
                                {(['left', 'center', 'right'] as const).map((pos) => (
                                    <label key={pos} className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="horizontal"
                                            value={pos}
                                            checked={horizontal === pos}
                                            onChange={(e) => setHorizontal(e.target.value as any)}
                                        />
                                        {pos === 'left' ? 'Gauche' : pos === 'center' ? 'Centre' : 'Droite'}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.controlGroup}>
                            <label>Position verticale</label>
                            <div className={styles.radioGroup}>
                                {(['top', 'center', 'bottom'] as const).map((pos) => (
                                    <label key={pos} className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="vertical"
                                            value={pos}
                                            checked={vertical === pos}
                                            onChange={(e) => setVertical(e.target.value as any)}
                                        />
                                        {pos === 'top' ? 'Haut' : pos === 'center' ? 'Centre' : 'Bas'}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={generateBanner}
                            disabled={loading}
                            className={styles.generateBtn}
                        >
                            {loading ? 'Génération...' : 'Générer la bannière'}
                        </button>
                    </div>

                    {/* Result */}
                    {bannerUrl && (
                        <div className={styles.resultSection}>
                            <h4>Bannière générée</h4>
                            <img src={bannerUrl} alt="Generated banner" className={styles.bannerResult} />
                            <button onClick={downloadBanner} className={styles.downloadBtn}>
                                Télécharger
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}