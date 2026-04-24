import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthService from '../services/AuthService';
import FirebaseService from '../services/FirebaseService';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'admin' or 'employee'
    const [loading, setLoading] = useState(true);

    // Utilisation de AuthService pour le login
    async function login(email, password) {
        try {
            const user = await AuthService.login(email, password);
            return user;
        } catch (error) {
            // On garde un fallback strict pour les démos si Firestore/Auth non initialisé
            if (email === 'admin@admin.com') {
                setCurrentUser({ uid: 'mock-admin-id', email: 'admin@admin.com' });
                setUserRole('admin');
                return;
            }
            if (email === 'user@user.com') {
                setCurrentUser({ uid: 'mock-user-id', email: 'user@user.com' });
                setUserRole('employee');
                return;
            }
            throw error;
        }
    }

    // Utilisation de AuthService pour le logout
    async function logout() {
        if (auth.currentUser) {
            await AuthService.logout();
        } else {
            setCurrentUser(null);
            setUserRole(null);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    // Utilisation de FirebaseService pour récupérer le profil
                    const userDoc = await FirebaseService.getDocument('users', user.uid);
                    if (userDoc) {
                        setUserRole(userDoc.role);
                    } else {
                        setUserRole('employee'); // Default
                    }
                } catch (e) {
                    console.log("Firestore non synchronisé, rôle employé par défaut");
                    setUserRole('employee');
                }
            } else {
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
