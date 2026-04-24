import { db } from '../firebase';
import { collection, doc, addDoc, getDocs, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

class FirebaseService {
    /**
     * Enregistre une nouvelle donnée dans une collection
     */
    async saveData(collectionName, data) {
        try {
            const docRef = await addDoc(collection(db, collectionName), data);
            return { id: docRef.id, ...data };
        } catch (error) {
            console.error(`Error saving data to ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Récupère tous les documents d'une collection
     */
    async getData(collectionName) {
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(`Error getting data from ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Récupère des documents selon une condition
     */
    async getDataByCondition(collectionName, fieldPath, opStr, value) {
        try {
            const q = query(collection(db, collectionName), where(fieldPath, opStr, value));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(`Error getting data by condition from ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Récupère un document spécifique par ID
     */
    async getDocument(collectionName, docId) {
        try {
            const docRef = doc(db, collectionName, docId);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                return { id: snapshot.id, ...snapshot.data() };
            }
            return null;
        } catch (error) {
            console.error(`Error getting document ${docId} from ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Met à jour un document
     */
    async updateData(collectionName, docId, data) {
        try {
            const docRef = doc(db, collectionName, docId);
            await updateDoc(docRef, data);
            return true;
        } catch (error) {
            console.error(`Error updating data in ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Supprime un document
     */
    async deleteData(collectionName, docId) {
        try {
            await deleteDoc(doc(db, collectionName, docId));
            return true;
        } catch (error) {
            console.error(`Error deleting data from ${collectionName}:`, error);
            throw error;
        }
    }
}

export default new FirebaseService();
