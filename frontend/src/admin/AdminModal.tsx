import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Edit3, Lock, Unlock, Upload, Film, Check, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';
import { type Project } from '../config/portfolio';
import {
  getStoredProjects,
  addProject,
  updateProject,
  deleteProject,
  resetProjectsToDefault,
  verifyAdminPin,
  setAdminPin,
} from './portfolioStorage';
import { getVideoFileUrl } from './indexedDB';
import { uploadVideo } from './videoUploader';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [changingPin, setChangingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'REELS' | 'CINEMATIC' | 'EXPERIMENTS'>('REELS');
  const [description, setDescription] = useState('');
  const [videoPath, setVideoPath] = useState('');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string>('');
  const [thumbnailPath, setThumbnailPath] = useState('');
  const [techniquesInput, setTechniquesInput] = useState('');
  const [date, setDate] = useState('2024');
  const [externalLink, setExternalLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Video file upload ref
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const thumbFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setProjects(getStoredProjects());
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyAdminPin(pinInput);
    if (ok) {
      setIsAuthenticated(true);
      setPinError(false);
      setProjects(getStoredProjects());
    } else {
      setPinError(true);
    }
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length >= 4) {
      setAdminPin(newPinInput.trim());
      setChangingPin(false);
      setNewPinInput('');
      alert('Admin PIN updated successfully!');
    } else {
      alert('PIN must be at least 4 characters');
    }
  };

  const startAddNew = () => {
    setEditingProject(null);
    setTitle('');
    setCategory('REELS');
    setDescription('');
    setVideoPath('');
    setSelectedVideoFile(null);
    setPreviewVideoUrl('');
    setThumbnailPath('');
    setTechniquesInput('Beat Sync, Speed Ramp, Color Grade');
    setDate(new Date().getFullYear().toString());
    setExternalLink('https://www.instagram.com/___ram_07/');
    setIsAddingNew(true);
  };

  const startEdit = async (proj: Project) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setCategory(proj.category as 'REELS' | 'CINEMATIC' | 'EXPERIMENTS');
    setDescription(proj.description);
    setSelectedVideoFile(null);

    // Try resolving from IndexedDB first
    const idbUrl = await getVideoFileUrl(proj.id);
    if (idbUrl) {
      setVideoPath(idbUrl);
      setPreviewVideoUrl(idbUrl);
    } else {
      setVideoPath(proj.videoPath);
      setPreviewVideoUrl(proj.videoPath);
    }

    setThumbnailPath(proj.thumbnailPath);
    setTechniquesInput(proj.techniques ? proj.techniques.join(', ') : '');
    setDate(proj.date || '2024');
    setExternalLink(proj.externalLink || '');
    setIsAddingNew(true);
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideoFile(file);
      const localUrl = URL.createObjectURL(file);
      setVideoPath(localUrl);
      setPreviewVideoUrl(localUrl);
    }
  };

  const handleThumbFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setThumbnailPath(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a project title');
      return;
    }

    setIsSaving(true);
    const targetId = editingProject ? editingProject.id : Date.now().toString();

    try {
      let finalVideoPath = videoPath.trim();

      // If user uploaded a physical video file, store to server disk and IndexedDB
      if (selectedVideoFile) {
        const result = await uploadVideo(targetId, selectedVideoFile);
        finalVideoPath = result.videoPath;
      }

      const techniques = techniquesInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingProject) {
        const updated: Project = {
          ...editingProject,
          title: title.trim(),
          category,
          description: description.trim(),
          videoPath: finalVideoPath,
          thumbnailPath: thumbnailPath.trim(),
          techniques,
          date: date.trim(),
          externalLink: externalLink.trim(),
        };
        updateProject(updated);
      } else {
        const newProj: Project = {
          id: targetId,
          title: title.trim(),
          category,
          description: description.trim(),
          videoPath: finalVideoPath,
          thumbnailPath: thumbnailPath.trim(),
          techniques,
          date: date.trim(),
          externalLink: externalLink.trim(),
        };
        addProject(newProj);
      }

      setProjects(getStoredProjects());
      setIsAddingNew(false);
      setEditingProject(null);
      setSelectedVideoFile(null);
      setPreviewVideoUrl('');
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Failed to save video. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, projTitle: string) => {
    if (confirm(`Are you sure you want to delete "${projTitle}"?`)) {
      await deleteProject(id);
      setProjects(getStoredProjects());
    }
  };

  const handleReset = () => {
    if (confirm('Reset all projects back to default portfolio settings?')) {
      resetProjectsToDefault();
      setProjects(getStoredProjects());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-md"
        >
          <div className="relative w-full max-w-4xl bg-[#111111] border border-white/15 max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#FF3535]/20 text-[#FF3535] flex items-center justify-center font-bold font-mono">
                  S
                </div>
                <div>
                  <h2
                    className="text-white text-lg font-bold tracking-tight"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    SRIRAM PORTFOLIO MANAGER
                  </h2>
                  <p className="text-[#A1A1AA] text-xs">
                    {isAuthenticated ? 'Admin Access — Add & Edit Reels' : 'Enter Admin PIN to manage videos'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-[#A1A1AA] hover:text-white hover:border-white/30 transition-colors"
                aria-label="Close Admin Modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {!isAuthenticated ? (
                /* Login Form */
                <div className="max-w-md mx-auto py-12 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 text-[#FF3535]">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ADMIN AUTHENTICATION
                  </h3>
                  <p className="text-[#A1A1AA] text-xs mb-6">
                    Enter your secret PIN to access the manager
                  </p>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <input
                        type="password"
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          setPinError(false);
                        }}
                        placeholder="Enter PIN"
                        className="w-full px-4 py-3 bg-[#080808] border border-white/20 text-white text-center text-lg tracking-[0.2em] font-mono focus:border-[#FF3535] outline-none transition-colors"
                        autoFocus
                      />
                      {pinError && (
                        <p className="text-[#FF3535] text-xs mt-2 font-mono">
                          Incorrect PIN. Try again.
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full btn-primary justify-center text-xs py-3"
                    >
                      <Unlock size={14} />
                      UNLOCK ADMIN DASHBOARD
                    </button>
                  </form>
                </div>
              ) : isAddingNew ? (
                /* Add / Edit Form */
                <form onSubmit={handleSaveProject} className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <h3 className="text-white font-bold text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {editingProject ? `EDIT: ${editingProject.title}` : 'ADD NEW REEL / VIDEO'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="text-xs text-[#A1A1AA] hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                        PROJECT / REEL TITLE *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Hyderabad Night Drive Reel"
                        className="w-full px-3 py-2.5 bg-[#080808] border border-white/15 text-white text-sm focus:border-[#FF3535] outline-none"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                        CATEGORY
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-[#080808] border border-white/15 text-white text-sm focus:border-[#FF3535] outline-none"
                      >
                        <option value="REELS">REELS</option>
                        <option value="CINEMATIC">CINEMATIC</option>
                        <option value="EXPERIMENTS">EXPERIMENTS</option>
                      </select>
                    </div>
                  </div>

                  {/* Video File Upload */}
                  <div className="p-4 bg-[#080808] border border-white/10 space-y-3">
                    <label className="block text-xs font-mono text-[#FF3535]">
                      SELECT VIDEO (Stored directly in your browser)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[11px] text-[#A1A1AA] block mb-1">
                          Option A: Browse MP4 File from your computer
                        </span>
                        <input
                          ref={videoFileInputRef}
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm"
                          onChange={handleVideoFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => videoFileInputRef.current?.click()}
                          className="w-full px-4 py-2.5 border border-dashed border-[#FF3535]/50 bg-[#FF3535]/5 text-white text-xs flex items-center justify-center gap-2 hover:bg-[#FF3535]/10 transition-colors"
                        >
                          <Upload size={14} className="text-[#FF3535]" />
                          Choose MP4 Video File
                        </button>
                      </div>

                      <div>
                        <span className="text-[11px] text-[#A1A1AA] block mb-1">
                          Option B: Or enter filename inside public/videos/
                        </span>
                        <input
                          type="text"
                          value={videoPath}
                          onChange={(e) => {
                            setVideoPath(e.target.value);
                            setPreviewVideoUrl(e.target.value);
                          }}
                          placeholder="e.g. /videos/reel1.mp4"
                          className="w-full px-3 py-2.5 bg-[#111111] border border-white/15 text-white text-xs focus:border-[#FF3535] outline-none"
                        />
                      </div>
                    </div>

                    {/* Live Video Preview Box */}
                    {previewVideoUrl && (
                      <div className="mt-3 p-3 bg-black border border-white/10 flex flex-col md:flex-row items-center gap-4">
                        <div className="w-24 aspect-9-16 bg-[#181818] overflow-hidden shrink-0 border border-white/20">
                          <video
                            src={previewVideoUrl}
                            controls
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-xs">
                          <p className="text-green-400 font-mono font-semibold flex items-center gap-1">
                            ✓ Video Loaded & Ready to Save
                          </p>
                          <p className="text-[#A1A1AA] text-[11px] mt-1">
                            {selectedVideoFile
                              ? `File: ${selectedVideoFile.name} (${(selectedVideoFile.size / (1024 * 1024)).toFixed(1)} MB)`
                              : `Path: ${videoPath}`}
                          </p>
                          <p className="text-white/40 text-[10px] mt-1">
                            You can click play on the small preview above to test it before saving.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="p-4 bg-[#080808] border border-white/10 space-y-3">
                    <label className="block text-xs font-mono text-[#A1A1AA]">
                      POSTER THUMBNAIL (Optional)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          ref={thumbFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleThumbFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => thumbFileInputRef.current?.click()}
                          className="w-full px-4 py-2 border border-dashed border-white/20 text-white/70 hover:border-white text-xs flex items-center justify-center gap-2"
                        >
                          <Upload size={14} />
                          Upload Poster Image
                        </button>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={thumbnailPath}
                          onChange={(e) => setThumbnailPath(e.target.value)}
                          placeholder="e.g. /images/thumbnails/reel1.jpg"
                          className="w-full px-3 py-2 bg-[#111111] border border-white/15 text-white text-xs focus:border-[#FF3535] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description / Caption */}
                  <div>
                    <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                      CAPTION / DESCRIPTION
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write what this edit is about, the vibe, rhythm, or camera gear used..."
                      className="w-full px-3 py-2 bg-[#080808] border border-white/15 text-white text-sm focus:border-[#FF3535] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Techniques */}
                    <div>
                      <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                        TECHNIQUES (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={techniquesInput}
                        onChange={(e) => setTechniquesInput(e.target.value)}
                        placeholder="Beat Sync, Speed Ramp, LUT"
                        className="w-full px-3 py-2 bg-[#080808] border border-white/15 text-white text-xs focus:border-[#FF3535] outline-none"
                      />
                    </div>

                    {/* Year */}
                    <div>
                      <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                        YEAR / DATE
                      </label>
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="2024"
                        className="w-full px-3 py-2 bg-[#080808] border border-white/15 text-white text-xs focus:border-[#FF3535] outline-none"
                      />
                    </div>

                    {/* Instagram Link */}
                    <div>
                      <label className="block text-xs font-mono text-[#A1A1AA] mb-1">
                        INSTAGRAM POST URL
                      </label>
                      <input
                        type="text"
                        value={externalLink}
                        onChange={(e) => setExternalLink(e.target.value)}
                        placeholder="https://www.instagram.com/p/..."
                        className="w-full px-3 py-2 bg-[#080808] border border-white/15 text-white text-xs focus:border-[#FF3535] outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="btn-primary text-xs py-3 flex-1 justify-center disabled:opacity-50"
                    >
                      <Check size={14} />
                      {isSaving ? 'SAVING VIDEO...' : editingProject ? 'SAVE CHANGES' : 'ADD TO PORTFOLIO'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="btn-secondary text-xs py-3 px-6"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Projects List */
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-white font-bold text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        YOUR ACTIVE PORTFOLIO VIDEOS ({projects.length})
                      </h3>
                      <p className="text-[#A1A1AA] text-xs">
                        Any video you add here instantly appears on your live portfolio!
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={startAddNew}
                        className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        ADD NEW REEL
                      </button>

                      <button
                        onClick={() => setChangingPin(!changingPin)}
                        className="p-2 border border-white/15 hover:border-white text-[#A1A1AA] hover:text-white transition-colors"
                        title="Change Admin PIN"
                      >
                        <KeyRound size={15} />
                      </button>

                      <button
                        onClick={handleReset}
                        className="p-2 border border-white/15 hover:border-[#FF3535] text-[#A1A1AA] hover:text-[#FF3535] transition-colors"
                        title="Reset to default"
                      >
                        <RefreshCw size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Change PIN box */}
                  {changingPin && (
                    <form onSubmit={handleUpdatePin} className="p-4 bg-[#080808] border border-white/15 flex items-center gap-3">
                      <input
                        type="text"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="Enter new PIN"
                        className="px-3 py-1.5 bg-[#111111] border border-white/20 text-white text-xs font-mono flex-1 outline-none focus:border-[#FF3535]"
                      />
                      <button type="submit" className="btn-primary text-xs py-2 px-4">
                        Update PIN
                      </button>
                      <button
                        type="button"
                        onClick={() => setChangingPin(false)}
                        className="text-xs text-[#A1A1AA] hover:text-white"
                      >
                        Cancel
                      </button>
                    </form>
                  )}

                  {/* Projects Table / Cards */}
                  <div className="space-y-3">
                    {projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 bg-[#080808] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-16 bg-[#181818] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center relative">
                            {proj.thumbnailPath ? (
                              <img src={proj.thumbnailPath} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Film size={20} className="text-white/30" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] tracking-wider text-[#FF3535] font-mono">
                                {proj.category}
                              </span>
                              {proj.date && (
                                <span className="text-[10px] text-[#A1A1AA] font-mono">
                                  • {proj.date}
                                </span>
                              )}
                            </div>
                            <h4
                              className="text-white font-bold text-sm tracking-wide"
                              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                            >
                              {proj.title}
                            </h4>
                            <p className="text-[#A1A1AA] text-xs line-clamp-1 max-w-lg mt-0.5">
                              {proj.description}
                            </p>
                            {proj.videoPath && (
                              <p className="text-[10px] text-green-400 font-mono mt-1 truncate max-w-xs">
                                📹 Video attached
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          {proj.externalLink && (
                            <a
                              href={proj.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 border border-white/10 hover:border-white text-[#A1A1AA] hover:text-white"
                              title="Open Instagram Post"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => startEdit(proj)}
                            className="p-2 border border-white/10 hover:border-white text-[#A1A1AA] hover:text-white"
                            title="Edit project"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(proj.id, proj.title)}
                            className="p-2 border border-white/10 hover:border-[#FF3535] text-[#A1A1AA] hover:text-[#FF3535]"
                            title="Delete project"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer status */}
            <div className="p-4 bg-[#080808] border-t border-white/10 flex items-center justify-between text-[11px] text-[#A1A1AA] font-mono">
              <span>SRIRAM PORTFOLIO CMS v1.0</span>
              <span>Videos persist in IndexedDB</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
