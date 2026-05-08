import { initializeApp, deleteApp } from 'firebase/app';
import app, { auth } from '../firebase';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

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

   
    async register(email, password) {
        try {
            // Pour éviter la déconnexion de l'admin, on utilise une instance secondaire temporaire
            const secondaryApp = initializeApp(app.options, "Secondary");
            const secondaryAuth = getAuth(secondaryApp);
            
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            
            // On déconnecte l'instance secondaire immédiatement et on la supprime
            await signOut(secondaryAuth);
            await deleteApp(secondaryApp);
            
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
