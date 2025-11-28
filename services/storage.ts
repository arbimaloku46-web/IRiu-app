import { Project, User, UserRole } from "../types";

const PROJECTS_KEY = 'ndertimi_v2_fresh';
const USERS_KEY = 'ndertimi_users_v2';

// Seed data - Empty to start fresh
const initialProjects: Project[] = [];

export const getProjects = (): Project[] => {
  const stored = localStorage.getItem(PROJECTS_KEY);
  if (!stored) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialProjects));
    return initialProjects;
  }
  return JSON.parse(stored);
};

export const saveProject = (project: Project): void => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const archiveProject = (id: string): void => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index >= 0) {
    projects[index].isArchived = true;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }
};

export const restoreProject = (id: string): void => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index >= 0) {
    projects[index].isArchived = false;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }
};

// Permanently delete
export const deleteProject = (id: string): void => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

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
  const users = getUsers();
  // Admin Check
  if (password === 'Ndertimi2024') {
     return { id: 'admin', emailOrPhone: 'admin', role: 'admin' };
  }
  
  const user = users.find(u => u.emailOrPhone === emailOrPhone && u.password === password);
  return user || null;
};
