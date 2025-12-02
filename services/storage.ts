import { Project, User, UserRole } from "../types";

const DB_NAME = 'NdertimiDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const USERS_KEY = 'ndertimi_users_v3';

// --- IndexedDB Helpers ---

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Failed to get projects from DB", e);
    return [];
  }
};

export const saveProject = async (project: Project): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(project);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const archiveProject = async (id: string): Promise<void> => {
  const projects = await getProjects();
  const project = projects.find(p => p.id === id);
  if (project) {
    project.isArchived = true;
    await saveProject(project);
  }
};

export const restoreProject = async (id: string): Promise<void> => {
  const projects = await getProjects();
  const project = projects.find(p => p.id === id);
  if (project) {
    project.isArchived = false;
    await saveProject(project);
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// --- Auth Storage (LocalStorage is fine for small text data) ---

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const registerUser = (emailOrPhone: string, password: string): User | null => {
  const users = getUsers();
  if (users.find(u => u.emailOrPhone === emailOrPhone)) {
    return null; // User exists
  }
  const newUser: User = {
    id: Date.now().toString(),
    emailOrPhone,
    password,
    role: 'client'
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

export const authenticateUser = (emailOrPhone: string, password: string): User | null => {
  // Admin Check
  if (password === 'Ndertimi2024') {
     return { id: 'admin', emailOrPhone: 'admin', role: 'admin' };
  }
  
  const users = getUsers();
  const user = users.find(u => u.emailOrPhone === emailOrPhone && u.password === password);
  return user || null;
};
