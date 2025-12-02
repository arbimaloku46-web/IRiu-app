import React, { useState, useEffect } from 'react';
import { Project, User } from '../types';
import { getProjects, saveProject, deleteProject, archiveProject, restoreProject } from '../services/storage';
import { Button, Card, Input, Modal, Select, TextArea } from '../components/ui';
import { Search, MapPin, ArrowRight, Phone, Mail, Plus, Trash2, Edit, Upload, Archive, RotateCcw, Loader2 } from 'lucide-react';

interface DashboardProps {
  user: User;
  onSelectProject: (project: Project) => void;
  onLogout: () => void;
}

// Factory function to ensure a fresh object is created each time
const getEmptyProject = (): Project => ({
  id: '',
  name: '',
  location: '',
  description: '',
  thumbnailUrl: '',
  clientAccessCode: '',
  status: 'Planning',
  updates: [],
  isArchived: false
});

export const Dashboard: React.FC<DashboardProps> = ({ user, onSelectProject, onLogout }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Independent access codes state per project ID
  const [accessCodes, setAccessCodes] = useState<Record<string, string>>({});
  
  // Admin State
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project>(getEmptyProject());
  const [thumbnailFile, setThumbnailFile] = useState<string>('');

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Filter based on Search Term AND Archive Status
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If Admin and showing archived: show only archived
    // If Admin and NOT showing archived: show only active
    // If Client: show only active (clients never see archive)
    const matchesArchiveStatus = user.role === 'admin' 
      ? (showArchived ? p.isArchived : !p.isArchived)
      : !p.isArchived;

    return matchesSearch && matchesArchiveStatus;
  });

  const handleAccessCodeChange = (projectId: string, code: string) => {
    setAccessCodes(prev => ({ ...prev, [projectId]: code }));
  };

  const handleAccessCodeSubmit = (project: Project) => {
    const enteredCode = accessCodes[project.id] || '';
    if (enteredCode === project.clientAccessCode || user.role === 'admin') {
      onSelectProject(project);
    } else {
      alert("Invalid Access Code");
    }
  };

  const handleSaveProject = async () => {
    // Explicit Validation
    if (!editingProject.name || editingProject.name.trim() === '') {
      alert("Please enter a Project Name.");
      return;
    }
    if (!editingProject.clientAccessCode || editingProject.clientAccessCode.trim() === '') {
      alert("Please enter a Client Access Code.");
      return;
    }

    try {
      setIsSaving(true);
      // Determine ID: use existing or generate new
      const projectId = editingProject.id || Date.now().toString();

      const projectToSave: Project = {
        ...editingProject,
        id: projectId,
        // Use uploaded file, or existing value, or default fallback
        thumbnailUrl: thumbnailFile || editingProject.thumbnailUrl || 'https://picsum.photos/800/600',
        updates: Array.isArray(editingProject.updates) ? editingProject.updates : [], // Safety check
        // If editing, keep existing archive status. If creating, force false.
        isArchived: editingProject.id ? (!!editingProject.isArchived) : false,
      };

      await saveProject(projectToSave);
      
      // Success actions
      await loadProjects();
      setIsModalOpen(false);
      
      // Reset State
      setEditingProject(getEmptyProject());
      setThumbnailFile('');
      
    } catch (error) {
      console.error("Error creating/saving project:", error);
      alert("An error occurred while saving the project. Please check the console.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveProject = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm("Move this project to the Archive? It will be hidden from all clients.")) {
      try {
        await archiveProject(id);
        await loadProjects();
        setIsModalOpen(false); 
      } catch (err) {
        console.error(err);
        alert("Failed to archive project.");
      }
    }
  };

  const handleRestoreProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Restore this project to Active status? Clients will be able to view it again.")) {
      try {
        await restoreProject(id);
        await loadProjects();
      } catch (err) {
        console.error(err);
        alert("Failed to restore project.");
      }
    }
  };

  const handlePermanentDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm("WARNING: This will PERMANENTLY delete the project and all its data. This cannot be undone.")) {
      try {
        await deleteProject(id);
        await loadProjects();
        setIsModalOpen(false);
      } catch (err) {
        console.error(err);
        alert("Failed to delete project.");
      }
    }
  };

  const openCreateModal = () => {
    setEditingProject(getEmptyProject());
    setThumbnailFile('');
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setThumbnailFile(''); // Reset file input, keep existing URL in project object
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-base">
      <header className="bg-[#002147] text-white py-4 sm:py-6 px-4 shadow-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ndërtimi</h1>
            <p className="text-xs sm:text-sm text-[#89cff0] font-medium mt-1">Welcome, {user.role === 'admin' ? 'Administrator' : user.emailOrPhone}</p>
          </div>
          <div className="flex gap-2">
            {user.role === 'admin' && (
              <Button onClick={openCreateModal} className="px-4 py-2 text-sm rounded-xl gap-2 bg-[#2264ab] hover:bg-white hover:text-[#002147]">
                <Plus size={18} /> <span className="hidden sm:inline">New Project</span>
              </Button>
            )}
            <Button variant="outline" onClick={onLogout} className="border-white/30 text-white hover:bg-white hover:text-[#002147] rounded-xl px-4 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-base h-auto">
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 flex-1 w-full">
        <div className="mb-6 sm:mb-10 flex flex-col md:flex-row gap-4 sm:gap-6 justify-between items-start md:items-center">
          <div>
             <h2 className="text-3xl sm:text-4xl font-bold text-[#002147]">
               {showArchived ? 'Archived Projects' : 'Active Projects'}
             </h2>
             {user.role === 'admin' && (
                <button 
                  onClick={() => setShowArchived(!showArchived)}
                  className="flex items-center gap-2 text-[#2264ab] font-bold mt-2 hover:underline text-sm sm:text-base"
                >
                  {showArchived ? (
                    <><ArrowRight size={16} /> Back to Active Projects</>
                  ) : (
                    <><Archive size={16} /> View Archived Projects</>
                  )}
                </button>
             )}
          </div>
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
            <input 
              className="w-full pl-10 sm:pl-12 pr-6 py-3 sm:py-4 rounded-2xl border border-gray-200 bg-white text-base sm:text-lg focus:ring-4 focus:ring-[#89cff0]/30 outline-none shadow-sm transition-all"
              placeholder={showArchived ? "Search archive..." : "Search projects..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#002147] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map(project => (
              <Card key={project.id} className="overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 border-0 p-0 flex flex-col h-full group relative">
                
                {user.role === 'admin' && (
                  <div className="absolute top-4 left-4 z-40 flex gap-2">
                    <button 
                      onClick={(e) => openEditModal(project, e)} 
                      className="bg-white p-2.5 rounded-full text-[#002147] hover:bg-[#2264ab] hover:text-white transition shadow-lg border border-gray-100" 
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    
                    {showArchived ? (
                      <>
                        <button 
                          onClick={(e) => handleRestoreProject(project.id, e)} 
                          className="bg-white p-2.5 rounded-full text-green-600 hover:bg-green-600 hover:text-white transition shadow-lg border border-gray-100" 
                          title="Restore to Active"
                        >
                          <RotateCcw size={18} />
                        </button>
                        <button 
                          onClick={(e) => handlePermanentDelete(project.id, e)} 
                          className="bg-white p-2.5 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition shadow-lg border border-gray-100" 
                          title="Permanently Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={(e) => handleArchiveProject(project.id, e)} 
                        className="bg-white p-2.5 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition shadow-lg border border-gray-100" 
                        title="Archive (Hide from Clients)"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                )}

                <div className={`relative h-56 sm:h-64 bg-gray-200 overflow-hidden ${showArchived ? 'grayscale' : ''}`}>
                  <img src={project.thumbnailUrl} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-[#002147]/90 backdrop-blur text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
                    {project.status}
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#002147] mb-2 sm:mb-3">{project.name}</h3>
                  <div className="flex items-center gap-2 text-gray-500 mb-4 sm:mb-5">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#2264ab]" />
                    <span className="text-sm sm:text-base font-medium">{project.location}</span>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 line-clamp-3 flex-1">{project.description}</p>
                  
                  {user.role === 'client' ? (
                    <div className="mt-auto pt-4 sm:pt-6 border-t border-gray-100">
                       <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 sm:mb-3">Enter Project Code to View</p>
                       <div className="flex gap-2 sm:gap-3">
                         <input 
                           type="text" 
                           className="flex-1 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-[#2264ab] outline-none" 
                           placeholder="Code..."
                           value={accessCodes[project.id] || ''}
                           onChange={(e) => handleAccessCodeChange(project.id, e.target.value)}
                         />
                         <button 
                           onClick={() => handleAccessCodeSubmit(project)}
                           className="bg-[#2264ab] text-white px-4 sm:px-5 rounded-xl hover:bg-[#002147] transition-colors shadow-lg shadow-[#2264ab]/20"
                         >
                           <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                         </button>
                       </div>
                    </div>
                  ) : (
                    <Button onClick={() => onSelectProject(project)} className="w-full mt-auto">
                      {showArchived ? 'View Details' : 'Manage Project'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
            {filteredProjects.length === 0 && (
              <div className="col-span-full text-center py-24 text-gray-400 text-lg">
                {showArchived 
                  ? 'No archived projects found.' 
                  : (user.role === 'admin' ? 'No active projects. Create one or check the archive.' : 'No active projects found.')}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-lg sm:text-xl font-bold text-[#002147]">Ndërtimi</h4>
            <p className="text-gray-500 text-xs sm:text-sm">Building dreams, tracking reality.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-[#002147]">
            <a href="tel:+355684778194" className="flex items-center gap-2 hover:text-[#2264ab] transition-colors font-medium text-base sm:text-lg">
              <Phone className="w-[18px] h-[18px] sm:w-5 sm:h-5" /> +355 68 477 8194
            </a>
            <a href="mailto:projekti@ndertimi.org" className="flex items-center gap-2 hover:text-[#2264ab] transition-colors font-medium text-base sm:text-lg">
              <Mail className="w-[18px] h-[18px] sm:w-5 sm:h-5" /> projekti@ndertimi.org
            </a>
          </div>
        </div>
      </footer>

      {/* Create/Edit Project Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProject.id ? "Edit Project" : "Create New Project"}
      >
        <div className="space-y-4">
          <Input 
            label="Project Name" 
            value={editingProject.name} 
            onChange={(e) => setEditingProject({...editingProject, name: e.target.value})} 
            placeholder="e.g. Seaside Tower"
          />
          <Input 
            label="Location" 
            value={editingProject.location} 
            onChange={(e) => setEditingProject({...editingProject, location: e.target.value})} 
            placeholder="e.g. Vlorë, Albania"
          />
          <Select 
            label="Current Status"
            value={editingProject.status}
            onChange={(e) => setEditingProject({...editingProject, status: e.target.value as any})}
            options={[
              { value: 'Planning', label: 'Planning' },
              { value: 'Foundation', label: 'Foundation' },
              { value: 'Structure', label: 'Structure' },
              { value: 'Finishing', label: 'Finishing' },
              { value: 'Completed', label: 'Completed' },
            ]}
          />
          <TextArea 
            label="Description" 
            value={editingProject.description} 
            onChange={(e) => setEditingProject({...editingProject, description: e.target.value})} 
            placeholder="Describe the project..."
          />
          <Input 
            label="Client Access Code" 
            value={editingProject.clientAccessCode} 
            onChange={(e) => setEditingProject({...editingProject, clientAccessCode: e.target.value})} 
            placeholder="Secure code for clients"
          />
          
          <div className="space-y-2">
            <label className="text-sm sm:text-base font-bold text-[#002147] ml-1">Thumbnail Image</label>
            <div className="flex flex-col gap-3">
               {/* URL Input */}
               <Input 
                 value={editingProject.thumbnailUrl}
                 onChange={(e) => setEditingProject({...editingProject, thumbnailUrl: e.target.value})}
                 placeholder="https://..."
               />
               <div className="text-center text-gray-400 text-sm font-bold">- OR -</div>
               {/* File Upload */}
               <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                 <label className="flex items-center gap-3 cursor-pointer">
                    <div className="bg-[#2264ab]/10 p-2 rounded-lg text-[#2264ab]">
                      <Upload size={20} />
                    </div>
                    <span className="text-gray-600 font-medium">Upload from device</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                 </label>
                 {(thumbnailFile || editingProject.thumbnailUrl) && (
                   <div className="mt-4 relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
                      <img src={thumbnailFile || editingProject.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
             <Button type="button" onClick={handleSaveProject} className="w-full" isLoading={isSaving}>
               {editingProject.id ? "Save Changes" : "Create Project"}
             </Button>
             
             {/* Delete Option within Modal for better Accessibility */}
             {editingProject.id && (
                <Button 
                  type="button"
                  onClick={() => handleArchiveProject(editingProject.id)} 
                  variant="danger" 
                  className="w-full mt-2"
                >
                  <Trash2 size={18} /> Archive / Delete Project
                </Button>
             )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
