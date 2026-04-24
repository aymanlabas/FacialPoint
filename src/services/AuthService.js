import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

class AuthService {
    /**
     * Connecter un utilisateur
     */
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Inscrire un nouvel utilisateur 
     * (Attention: en production, cela doit souvent passer par une Firebase Function 
     * pour éviter de déconnecter l'Admin actuel)
     */
    async register(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Déconnecter l'utilisateur actuel
     */
    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }
}

export default new AuthService();
