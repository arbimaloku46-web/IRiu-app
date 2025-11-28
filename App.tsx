import React, { useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetails } from './pages/ProjectDetails';
import { User, Project } from './types';
import { saveProject } from './services/storage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentProject(null);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    saveProject(updatedProject);
    setCurrentProject(updatedProject);
  };

  // Simple State-based Routing
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentProject) {
    return (
      <ProjectDetails 
        project={currentProject} 
        user={user} 
        onBack={() => setCurrentProject(null)} 
        onUpdateProject={handleUpdateProject}
      />
    );
  }

  return (
    <Dashboard 
      user={user} 
      onSelectProject={setCurrentProject} 
      onLogout={handleLogout}
    />
  );
};

export default App;
