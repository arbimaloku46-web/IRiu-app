import React, { useState } from 'react';
import { Project, WeeklyUpdate, User, MediaItem } from '../types';
import { Button, Card, Modal, Input, TextArea, Select } from '../components/ui';
import { ArrowLeft, Box, Video, Camera, FileText, BrainCircuit, Play, ChevronDown, ChevronUp, Phone, Mail, Upload, Link as LinkIcon, Plus, X } from 'lucide-react';
import { analyzeProjectProgress } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ProjectDetailsProps {
  project: Project;
  user: User;
  onBack: () => void;
  onUpdateProject: (p: Project) => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, user, onBack, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'updates' | 'ai'>('updates');
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(project.updates[0]?.id || null);
  
  // AI State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Admin: Add Update State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUpdateDesc, setNewUpdateDesc] = useState('');
  const [newUpdateWeek, setNewUpdateWeek] = useState((project.updates.length + 1).toString());
  
  // Admin: Media Management
  const [pendingMedia, setPendingMedia] = useState<MediaItem[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video' | '3d-polycam' | '360-floorfy'>('image');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaInputType, setMediaInputType] = useState<'url' | 'file'>('url');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaFileBase64, setMediaFileBase64] = useState('');

  const handleAiAnalysis = async () => {
    setIsAiThinking(true);
    setAiResponse('');
    const response = await analyzeProjectProgress(project, aiQuery);
    setAiResponse(response);
    setIsAiThinking(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to extract src from iframe code if user pastes full embed code
  const processEmbedCode = (input: string) => {
    if (input.includes('<iframe')) {
       const srcMatch = input.match(/src="([^"]+)"/);
       return srcMatch ? srcMatch[1] : input;
    }
    return input;
  };

  const addMediaToPending = () => {
    if (!mediaTitle) {
      alert("Please provide a title for the media.");
      return;
    }

    let finalUrl = '';
    if (mediaInputType === 'file') {
      if (!mediaFileBase64) {
        alert("Please select a file.");
        return;
      }
      finalUrl = mediaFileBase64;
    } else {
      if (!mediaUrlInput) {
        alert("Please provide a URL.");
        return;
      }
      finalUrl = processEmbedCode(mediaUrlInput);
    }

    const newItem: MediaItem = {
      id: Date.now().toString(),
      type: mediaType,
      url: finalUrl,
      title: mediaTitle
    };

    setPendingMedia([...pendingMedia, newItem]);
    
    // Reset Form
    setMediaTitle('');
    setMediaUrlInput('');
    setMediaFileBase64('');
    // Keep type and input type same for convenience
  };

  const removePendingMedia = (id: string) => {
    setPendingMedia(pendingMedia.filter(m => m.id !== id));
  };

  const handleAddUpdate = () => {
    const newUpdate: WeeklyUpdate = {
      id: Date.now().toString(),
      weekNumber: parseInt(newUpdateWeek),
      date: new Date().toISOString().split('T')[0],
      description: newUpdateDesc,
      media: pendingMedia
    };
    
    const updatedProject = {
      ...project,
      updates: [newUpdate, ...project.updates]
    };
    
    onUpdateProject(updatedProject);
    setIsAddModalOpen(false);
    setNewUpdateDesc('');
    setPendingMedia([]);
    setMediaTitle('');
    setMediaUrlInput('');
    setMediaFileBase64('');
  };

  const toggleUpdate = (id: string) => {
    setExpandedUpdate(expandedUpdate === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
       <header className="bg-[#002147] text-white p-6 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <button onClick={onBack} className="hover:bg-white/10 p-3 rounded-2xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
             <h1 className="text-3xl font-bold">{project.name}</h1>
             <p className="text-base text-[#89cff0] font-medium mt-1">{project.location} • {project.status}</p>
          </div>
          {user.role === 'admin' && (
            <Button onClick={() => setIsAddModalOpen(true)} variant="secondary" className="text-base px-6">
              Add Weekly Update
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full p-6 flex-1">
        
        {/* Navigation Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('updates')}
            className={`pb-4 px-2 text-lg font-bold transition-all border-b-4 whitespace-nowrap ${activeTab === 'updates' ? 'border-[#2264ab] text-[#2264ab]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Weekly Progress
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`pb-4 px-2 text-lg font-bold transition-all border-b-4 flex items-center gap-2 whitespace-nowrap ${activeTab === 'ai' ? 'border-[#2264ab] text-[#2264ab]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <BrainCircuit className="w-6 h-6" /> AI Analysis
          </button>
        </div>

        {activeTab === 'updates' && (
          <div className="space-y-8">
            {project.updates.length === 0 ? (
               <div className="text-center py-24 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-lg">
                 No updates available yet. Check back soon!
               </div>
            ) : (
              project.updates.map((update) => (
                <Card key={update.id} className={`transition-all duration-300 ${expandedUpdate === update.id ? 'ring-2 ring-[#89cff0]' : ''}`}>
                  <div 
                    className="flex justify-between items-center cursor-pointer select-none py-2"
                    onClick={() => toggleUpdate(update.id)}
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-[#002147] mb-1">Week {update.weekNumber}</h3>
                      <p className="text-base text-gray-500 font-medium">{update.date}</p>
                    </div>
                    <button className={`bg-gray-100 p-3 rounded-full text-[#2264ab] transition-transform duration-300 ${expandedUpdate === update.id ? 'rotate-180 bg-[#2264ab]/10' : ''}`}>
                      <ChevronDown className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {expandedUpdate === update.id && (
                    <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn">
                      <p className="text-gray-700 text-lg leading-relaxed mb-8 whitespace-pre-line">{update.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {update.media.map(item => (
                          <div key={item.id} className="group relative w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all h-[300px]">
                            {/* Render Logic */}
                            {item.type === 'image' && (
                              <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            )}
                            
                            {item.type === 'video' && (
                              <video controls className="w-full h-full object-cover bg-black">
                                <source src={item.url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            )}

                            {(item.type === '3d-polycam' || item.type === '360-floorfy') && (
                              <iframe 
                                src={item.url} 
                                title={item.title} 
                                className="w-full h-full border-0" 
                                allowFullScreen
                                allow="xr-spatial-tracking"
                              ></iframe>
                            )}

                            {/* Overlay for Image/Generic */}
                            {item.type === 'image' && (
                                <div className="absolute inset-0 bg-[#002147]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-3 text-white backdrop-blur-[2px]">
                                    <FileText className="w-10 h-10" />
                                    <span className="text-sm font-bold px-4 text-center">{item.title}</span>
                                    <a href={item.url} target="_blank" rel="noreferrer" className="bg-white text-[#002147] px-4 py-2 rounded-xl text-sm font-bold mt-2 hover:bg-[#89cff0] transition shadow-lg">View Full</a>
                                </div>
                            )}

                            {/* Label Tag */}
                            <div className="absolute top-3 left-3 bg-white/90 text-[#002147] text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider z-10 pointer-events-none">
                              {item.type.replace('-', ' ')}
                            </div>
                          </div>
                        ))}
                         {update.media.length === 0 && (
                            <div className="col-span-full text-center text-base text-gray-400 py-8 italic bg-gray-50 rounded-2xl">No media attached for this week.</div>
                         )}
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-white to-[#f0f7ff] border-[#2264ab]/10">
              <div className="flex items-center gap-4 mb-6">
                 <div className="bg-[#2264ab] p-3 rounded-2xl text-white shadow-lg shadow-[#2264ab]/20">
                   <BrainCircuit className="w-8 h-8" />
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold text-[#002147]">AI Project Intelligence</h2>
                   <p className="text-[#2264ab] font-medium text-sm">Powered by Gemini 3 Pro</p>
                 </div>
              </div>
              
              <p className="text-gray-600 mb-8 text-base leading-relaxed">
                Utilize our advanced AI to analyze construction logs, detect potential delays, and summarize progress. 
                This feature uses deep thinking capabilities to provide accurate insights.
              </p>

              <div className="flex gap-4 mb-8 flex-col sm:flex-row">
                <Input 
                  value={aiQuery} 
                  onChange={(e) => setAiQuery(e.target.value)} 
                  placeholder="Ask a specific question (optional)..."
                  className="flex-1"
                />
                <Button onClick={handleAiAnalysis} isLoading={isAiThinking} className="whitespace-nowrap px-8">
                  {aiQuery ? 'Ask AI' : 'Generate Full Report'}
                </Button>
              </div>

              {aiResponse && (
                <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm prose prose-lg max-w-none prose-headings:text-[#002147] prose-a:text-[#2264ab] prose-strong:text-[#002147]">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              )}
              
              {!aiResponse && !isAiThinking && (
                 <div className="text-center py-16 text-gray-400">
                    <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Ready to analyze project data.</p>
                 </div>
              )}
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold text-[#002147]">Ndërtimi</h4>
            <p className="text-gray-500 text-sm">Building dreams, tracking reality.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 text-[#002147]">
            <a href="tel:+355684778194" className="flex items-center gap-2 hover:text-[#2264ab] transition-colors font-medium text-lg">
              <Phone size={20} /> +355 68 477 8194
            </a>
            <a href="mailto:projekti@ndertimi.org" className="flex items-center gap-2 hover:text-[#2264ab] transition-colors font-medium text-lg">
              <Mail size={20} /> projekti@ndertimi.org
            </a>
          </div>
        </div>
      </footer>

      {/* Admin Add Update Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Weekly Update">
         <div className="space-y-6">
           <Input 
             label="Week Number" 
             type="number" 
             value={newUpdateWeek} 
             onChange={(e) => setNewUpdateWeek(e.target.value)} 
           />
           <TextArea 
             label="Description" 
             value={newUpdateDesc}
             onChange={(e) => setNewUpdateDesc(e.target.value)}
             placeholder="Detail the construction progress for this week..."
           />
           
           <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-[#002147] mb-4">Add Media</h3>
              <div className="bg-gray-50 p-4 rounded-2xl space-y-4">
                <Input 
                  label="Media Title" 
                  value={mediaTitle} 
                  onChange={(e) => setMediaTitle(e.target.value)} 
                  placeholder="e.g., Drone Footage or Floor Scan"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Select 
                    label="Media Type"
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as any)}
                    options={[
                      { value: 'image', label: 'Image' },
                      { value: 'video', label: 'Video' },
                      { value: '3d-polycam', label: 'Polycam 3D' },
                      { value: '360-floorfy', label: 'Floorfy 360' },
                    ]}
                  />
                   <div className="flex flex-col gap-2">
                     <label className="text-sm sm:text-base font-bold text-[#002147] ml-1">Source</label>
                     <div className="flex bg-white rounded-xl p-1 border border-gray-200">
                        <button 
                          onClick={() => setMediaInputType('url')}
                          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mediaInputType === 'url' ? 'bg-[#002147] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          Link / Iframe
                        </button>
                        <button 
                          onClick={() => setMediaInputType('file')}
                          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mediaInputType === 'file' ? 'bg-[#002147] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          Upload
                        </button>
                     </div>
                   </div>
                </div>

                {mediaInputType === 'url' ? (
                  <Input 
                    placeholder={mediaType === '3d-polycam' ? "Paste Polycam URL or Embed code" : "https://..."}
                    value={mediaUrlInput}
                    onChange={(e) => setMediaUrlInput(e.target.value)}
                  />
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                     <label className="flex items-center justify-center gap-3 cursor-pointer w-full">
                        <div className="bg-[#2264ab]/10 p-2 rounded-lg text-[#2264ab]">
                          <Upload size={20} />
                        </div>
                        <span className="text-gray-600 font-medium">
                          {mediaFileBase64 ? 'File Selected' : 'Choose File from Device'}
                        </span>
                        <input type="file" className="hidden" accept={mediaType === 'video' ? 'video/*' : 'image/*'} onChange={handleFileSelect} />
                     </label>
                     {mediaFileBase64 && (
                        <div className="mt-2 text-xs text-green-600 font-bold text-center">Ready to add</div>
                     )}
                  </div>
                )}

                <Button onClick={addMediaToPending} variant="secondary" className="w-full h-10 py-0 text-sm">
                  <Plus size={16} /> Add to Update
                </Button>
              </div>
           </div>

           {/* Pending Media List */}
           {pendingMedia.length > 0 && (
              <div className="space-y-2">
                 <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Attachments ({pendingMedia.length})</h4>
                 {pendingMedia.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                             {m.type === 'image' && <img src={m.url} className="w-full h-full object-cover" />}
                             {m.type !== 'image' && <div className="w-full h-full flex items-center justify-center text-gray-400"><LinkIcon size={16}/></div>}
                          </div>
                          <div>
                             <p className="font-bold text-sm text-[#002147]">{m.title}</p>
                             <p className="text-xs text-gray-500">{m.type}</p>
                          </div>
                       </div>
                       <button onClick={() => removePendingMedia(m.id)} className="text-red-400 hover:text-red-600 p-2">
                         <X size={18} />
                       </button>
                    </div>
                 ))}
              </div>
           )}

           <Button onClick={handleAddUpdate} className="w-full">Post Update</Button>
         </div>
      </Modal>
    </div>
  );
};