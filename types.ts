export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  emailOrPhone: string;
  role: UserRole;
  password?: string; // stored plainly for this demo mock
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | '3d-polycam' | '360-floorfy';
  url: string;
  title: string;
}

export interface WeeklyUpdate {
  id: string;
  weekNumber: number;
  date: string;
  description: string;
  media: MediaItem[];
}

export interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  thumbnailUrl: string;
  clientAccessCode: string; // Code clients use to "claim" or view this project
  updates: WeeklyUpdate[];
  status: 'Planning' | 'Foundation' | 'Structure' | 'Finishing' | 'Completed';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
