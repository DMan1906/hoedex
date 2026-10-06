import { Client, Account, Databases, Storage, ID } from 'appwrite';

// Citim variabilele de mediu injectate de Vite
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const CATCHES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CATCHES_COLLECTION_ID;
export const MILESTONES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MILESTONES_COLLECTION_ID;
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_ID;

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID };
