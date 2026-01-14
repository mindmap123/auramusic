"use client";

import { useState, useEffect } from "react";
import BannerPositionEditor from "@/components/admin/BannerPositionEditor";

interface Style {
    id: string;
    name: string;
    coverUrl: string;
    bannerHorizontal: string;
    bannerVertical: string;
}

export default function BannerEditorPage() {
    const [styles, setStyles] = useState<Style[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStyles();
    }, []);

    const fetchStyles = async () => {
        try {
            const response = await fetch('/api/styles');
            const data = await response.json();
            setStyles(data);
        } catch (error) {
            console.error('Error fetching styles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (styleId: string, horizontal: string, vertical: string) => {
        try {
            const response = await fetch(`/api/admin/styles/${styleId}/banner-position`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ horizontal, vertical }),
            });

            if (response.ok) {
                // Mettre à jour l'état local
                setStyles(prev => prev.map(style => 
                    style.id === styleId 
                        ? { ...style, bannerHorizontal: horizontal, bannerVertical: vertical }
                        : style
                ));
                alert('Position sauvegardée !');
            } else {
                alert('Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Error saving banner position:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', color: 'white' }}>Chargement...</div>;
    }

    return (
        <div style={{ 
            padding: '2rem', 
            minHeight: '100vh', 
            background: 'var(--bg-base)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
        }}>
            <h1 style={{ color: 'white', marginBottom: '1rem' }}>Éditeur de Position des Bannières</h1>
            
            {styles.filter(style => style.coverUrl).map(style => (
                <BannerPositionEditor
                    key={style.id}
                    styleId={style.id}
                    styleName={style.name}
                    coverUrl={style.coverUrl}
                    currentHorizontal={style.bannerHorizontal}
                    currentVertical={style.bannerVertical}
                    onSave={(horizontal, vertical) => handleSave(style.id, horizontal, vertical)}
                />
            ))}
        </div>
    );
}