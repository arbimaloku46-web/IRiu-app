import { Project, User, UserRole } from "../types";

const PROJECTS_KEY = 'ndertimi_projects';
const USERS_KEY = 'ndertimi_users';

// Seed data
const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Emerald Tower',
    location: 'Tirana, Albania',
    description: 'A 25-story luxury residential complex with integrated smart home features.',
    thumbnailUrl: 'https://picsum.photos/800/600',
    clientAccessCode: 'EMERALD123',
    status: 'Structure',
    updates: [
      {
        id: 'u1',
        weekNumber: 10,
        date: '2024-05-15',
        description: 'Completed the pouring of the 15th-floor slab. Installation of HVAC ducts on floors 1-5 has commenced.',
        media: [
          { id: 'm1', type: 'image', url: 'https://picsum.photos/800/600?random=1', title: 'Slab Pouring' },
          { id: 'm2', type: '3d-polycam', url: '#', title: 'Week 10 Scan' }
        ]
      },
      {
        id: 'u2',
        weekNumber: 11,
        date: '2024-05-22',
        description: 'Structural columns for floor 16 are being reinforced. Facade sample testing approved by client.',
        media: [
          { id: 'm3', type: 'image', url: 'https://picsum.photos/800/600?random=2', title: 'Column Reinforcement' },
          { id: 'm4', type: '360-floorfy', url: '#', title: 'Lobby 360 View' }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Sunny Side Apartments',
    location: 'Durrës, Albania',
    description: 'Beachfront residential units with underground parking.',
    thumbnailUrl: 'https://picsum.photos/800/600?random=10',
    clientAccessCode: 'SUNNY456',
    status: 'Foundation',
    updates: [
      {
        id: 'u3',
        weekNumber: 1,
        date: '2024-06-01',
        description: 'Excavation complete. Laying of foundation rebar initiated.',
        media: [
          { id: 'm5', type: 'video', url: '#', title: 'Drone Overview' }
        ]
      }
    ]
  }
];

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
