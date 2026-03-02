"use client";

import { AlertTriangle } from "lucide-react";
import styles from "./SessionConflictModal.module.css";

interface SessionConflictModalProps {
    show: boolean;
}

export default function SessionConflictModal({ show }: SessionConflictModalProps) {
    if (!show) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.icon}>
                    <AlertTriangle size={48} />
                </div>
                <h2 className={styles.title}>Compte utilisé ailleurs</h2>
                <p className={styles.message}>
                    Votre compte est actuellement utilisé sur un autre appareil.
                    <br />
                    Vous allez être déconnecté dans quelques instants...
                </p>
                <div className={styles.spinner} />
            </div>
        </div>
    );
}
