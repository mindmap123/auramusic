"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import styles from "./SignOutButton.module.css";

export default function SignOutButton() {
    return (
        <button onClick={() => signOut()} className={styles.button}>
            <LogOut size={18} />
            <span>Déconnexion</span>
        </button>
    );
}
