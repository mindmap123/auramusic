import { useState, useEffect } from "react";
import { X, Download, Calendar } from "lucide-react";
import styles from "./SessionsModal.module.css";

interface Session {
    id: string;
    styleName: string;
    startedAt: string;
    endedAt: string | null;
    duration: number;
    isActive: boolean;
}

interface SessionsModalProps {
    storeId: string;
    storeName: string;
    onClose: () => void;
}

export default function SessionsModal({ storeId, storeName, onClose }: SessionsModalProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchSessions();
    }, [storeId, startDate, endDate]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            
            const res = await fetch(`/api/admin/stores/${storeId}/sessions?${params}`);
            const data = await res.json();
            setSessions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const params = new URLSearchParams({ format: 'csv' });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        window.location.href = `/api/admin/stores/${storeId}/sessions?${params}`;
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR');
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Sessions d&apos;écoute - {storeName}</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.filters}>
                    <div className={styles.dateFilter}>
                        <Calendar size={18} />
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            placeholder="Date début"
                        />
                        <span>à</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            placeholder="Date fin"
                        />
                    </div>
                    <button onClick={handleExportCSV} className="btn-secondary">
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>Chargement...</div>
                    ) : sessions.length === 0 ? (
                        <div className={styles.empty}>Aucune session</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Style</th>
                                    <th>Début</th>
                                    <th>Fin</th>
                                    <th>Durée</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map(session => (
                                    <tr key={session.id}>
                                        <td>{session.styleName}</td>
                                        <td>{formatDate(session.startedAt)}</td>
                                        <td>
                                            {session.endedAt 
                                                ? formatDate(session.endedAt) 
                                                : <span className={styles.active}>En cours</span>
                                            }
                                        </td>
                                        <td>{formatDuration(session.duration)}</td>
                                        <td>
                                            <span className={session.isActive ? styles.activeBadge : styles.completedBadge}>
                                                {session.isActive ? "Active" : "Terminée"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className={styles.footer}>
                    <div className={styles.summary}>
                        Total: {sessions.length} session{sessions.length > 1 ? 's' : ''}
                        {sessions.filter(s => s.isActive).length > 0 && (
                            <span className={styles.activeCount}>
                                {" "}• {sessions.filter(s => s.isActive).length} active{sessions.filter(s => s.isActive).length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
