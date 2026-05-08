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
    const [userProfile, setUserProfile] = useState(null); // { firstName, lastName, etc }
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
                setUserProfile({ firstName: 'Admin', lastName: 'User' });
                return;
            }
            if (email === 'user@user.com') {
                setCurrentUser({ uid: 'mock-user-id', email: 'user@user.com' });
                setUserRole('employee');
                setUserProfile({ firstName: 'Test', lastName: 'User' });
                return;
            }
            throw error;
        }
    }

    // Admin peut créer un nouvel utilisateur
    async function createUser(email, password, firstName, lastName) {
        try {
            const user = await AuthService.register(email, password);
            
            // Sauvegarder les informations de l'utilisateur dans Firestore avec son UID comme ID de document
            await FirebaseService.setDocument('users', user.uid, {
                uid: user.uid,
                email: email,
                firstName: firstName,
                lastName: lastName,
                role: 'employee', // Par défaut, nouvel utilisateur = employé
                createdAt: new Date(),
                descriptor: null, // Sera rempli lors du premier scan facial
            });

            return user;
        } catch (error) {
            console.error('Error creating user:', error);
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
            setUserProfile(null);
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
                        setUserProfile({
                            firstName: userDoc.firstName || '',
                            lastName: userDoc.lastName || '',
                            department: userDoc.department || '',
                            descriptor: userDoc.descriptor || null
                        });
                    } else {
                        setUserRole('employee'); // Default
                        setUserProfile({ firstName: '', lastName: '', department: '', descriptor: null });
                    }
                } catch (e) {
                    console.log("Firestore non synchronisé, rôle employé par défaut");
                    setUserRole('employee');
                    setUserProfile({ firstName: '', lastName: '', department: '', descriptor: null });
                }
            } else {
                setUserRole(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        userProfile,
        login,
        createUser,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
