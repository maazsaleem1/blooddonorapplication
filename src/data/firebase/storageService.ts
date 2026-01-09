/**
 * Firebase Storage Service
 * Handles file uploads to Firebase Storage
 * NO UI logic - Pure service layer
 */
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../core/config/firebaseConfig';

export class StorageService {
    /**
     * Upload image to Firebase Storage
     */
    static async uploadImage(uri: string, path: string): Promise<string> {
        try {
            // Read file as blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Create storage reference
            const storageRef = ref(storage, path);

            // Upload file
            await uploadBytes(storageRef, blob);

            // Get download URL
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error: any) {
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }

    /**
     * Delete file from Firebase Storage
     */
    static async deleteFile(path: string): Promise<void> {
        try {
            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
        } catch (error: any) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
}

