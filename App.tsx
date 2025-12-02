import React, { useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetails } from './pages/ProjectDetails';
import { User, Project } from './types';
import { saveProject, archiveProject } from './services/storage';

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

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      await saveProject(updatedProject);
      setCurrentProject(updatedProject);
    } catch (error) {
      console.error("Failed to update project:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm("Are you sure you want to archive this project?\n\nIt will be hidden from all clients immediately and moved to the 'Archived' section.")) {
      try {
        await archiveProject(projectId);
        setCurrentProject(null);
      } catch (error) {
        console.error("Failed to archive project:", error);
        alert("Failed to archive project.");
      }
    }
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
        onDeleteProject={handleDeleteProject}
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
