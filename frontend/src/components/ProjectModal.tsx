import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Play, Pause, Volume2, VolumeX, Maximize, AlertCircle, Upload, Check } from 'lucide-react';
import type { Project } from '../config/portfolio';
import { getVideoFileUrl } from '../admin/indexedDB';
import { uploadVideo } from '../admin/videoUploader';
import { updateProject, getAuthToken } from '../admin/portfolioStorage';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenAdmin?: () => void;
}

export default function ProjectModal({ project, onClose, onOpenAdmin }: ProjectModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [resolvedVideoSrc, setResolvedVideoSrc] = useState<string>('');
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let isMounted = true;
    setVideoError(false);
    setIsLoading(true);
    setPlaying(false);
    setUploadSuccess(false);

    if (!project) return;
    const currentProj = project;

    async function resolveSource() {
      // 1. Check if video is stored in IndexedDB for this project
      const idbUrl = await getVideoFileUrl(currentProj.id);
      if (idbUrl && isMounted) {
        setResolvedVideoSrc(idbUrl);
        setIsLoading(false);
        return;
      }

      // 2. Otherwise check videoPath
      if (currentProj.videoPath && isMounted) {
        if (currentProj.videoPath.startsWith('blob:') && !idbUrl) {
          // Dead blob URL
          if (isMounted) {
            setVideoError(true);
            setIsLoading(false);
          }
          return;
        }

        setResolvedVideoSrc(currentProj.videoPath);
        setIsLoading(false);
      } else if (isMounted) {
        setIsLoading(false);
      }
    }

    resolveSource();

    return () => {
      isMounted = false;
    };
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const t = setTimeout(() => closeButtonRef.current?.focus(), 100);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;

    if (v.paused) {
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlaying(true);
            setVideoError(false);
          })
          .catch((err) => {
            console.warn('Playback failed:', err);
            v.muted = true;
            setMuted(true);
            v.play()
              .then(() => setPlaying(true))
              .catch(() => setVideoError(true));
          });
      }
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const goFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    videoRef.current?.requestFullscreen();
  };

  // Quick Direct Upload right on the modal
  const handleDirectVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    setIsUploading(true);
    setVideoError(false);

    try {
      const result = await uploadVideo(project.id, file);
      // Update project in storage
      const updated: Project = {
        ...project,
        videoPath: result.videoPath,
      };
      updateProject(updated);

      setResolvedVideoSrc(result.videoPath);
      setUploadSuccess(true);
      setVideoError(false);

      // Auto start video after 300ms
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }, 300);
    } catch (err) {
      console.error('Direct upload failed:', err);
      alert('Failed to attach video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-[#111111] border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ zIndex: 1 }}
          >
            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center bg-black/60 hover:bg-black/90 text-white transition-colors border border-white/20"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            {/* Video container — 9:16 */}
            <div className="relative bg-[#080808] mx-auto overflow-hidden" style={{ maxWidth: 340 }}>
              <div
                className="aspect-9-16 relative cursor-pointer group bg-black flex items-center justify-center"
                onClick={togglePlay}
              >
                {resolvedVideoSrc && !videoError ? (
                  <video
                    ref={videoRef}
                    src={resolvedVideoSrc}
                    poster={project.thumbnailPath || undefined}
                    preload="auto"
                    playsInline
                    controls={false}
                    className="w-full h-full object-cover"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => setPlaying(false)}
                    onError={() => {
                      setVideoError(true);
                      setPlaying(false);
                    }}
                    aria-label={`${project.title} video`}
                  />
                ) : videoError ? (
                  /* Error screen */
                  <div
                    className="p-6 text-center text-white/70 flex flex-col items-center justify-center gap-3 w-full h-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AlertCircle size={36} className="text-[#FF3535]" />
                    <p className="text-sm font-semibold text-white">Video not attached or expired</p>
                    <p className="text-xs text-[#A1A1AA] max-w-xs leading-relaxed">
                      This reel preview is currently being updated.
                    </p>

                    {/* ONLY allow upload if authenticated admin */}
                    {getAuthToken() ? (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm"
                          onChange={handleDirectVideoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2"
                        >
                          <Upload size={14} />
                          {isUploading ? 'ATTACHING VIDEO...' : 'ADMIN: ATTACH MP4 VIDEO'}
                        </button>
                        {uploadSuccess && (
                          <p className="text-green-400 text-xs font-mono flex items-center gap-1 mt-1">
                            <Check size={12} /> Video attached successfully!
                          </p>
                        )}
                      </>
                    ) : (
                      onOpenAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAdmin();
                          }}
                          className="mt-2 border border-white/20 hover:border-[#FF3535] text-white/60 hover:text-white text-xs py-2 px-3 inline-flex items-center gap-1.5 transition-colors font-mono"
                        >
                          ADMIN LOGIN TO ATTACH VIDEO
                        </button>
                      )
                    )}
                  </div>
                ) : isLoading ? (
                  <div className="text-white/40 text-xs font-mono animate-pulse">
                    Loading video...
                  </div>
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-14 h-14 rounded-full border border-dashed border-white/30 flex items-center justify-center mb-3 text-white/40">
                      <Play size={24} className="ml-1" />
                    </div>
                    <p className="text-white/70 text-xs font-semibold mb-2">No video file attached</p>

                    {/* ONLY allow upload if authenticated admin */}
                    {getAuthToken() ? (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm"
                          onChange={handleDirectVideoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-primary text-xs py-2 px-3 inline-flex items-center gap-2"
                        >
                          <Upload size={13} />
                          {isUploading ? 'Attaching...' : 'ADMIN: Choose MP4 Video'}
                        </button>
                      </>
                    ) : (
                      onOpenAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAdmin();
                          }}
                          className="border border-white/20 hover:border-[#FF3535] text-white/60 hover:text-white text-xs py-1.5 px-3 inline-flex items-center gap-1.5 transition-colors font-mono"
                        >
                          ADMIN LOGIN
                        </button>
                      )
                    )}
                  </div>
                )}

                {/* Big Center Play / Pause Overlay */}
                {resolvedVideoSrc && !videoError && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none ${
                      playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-white/80 flex items-center justify-center bg-black/40 backdrop-blur-sm shadow-xl">
                      {playing ? (
                        <Pause size={24} fill="white" />
                      ) : (
                        <Play size={26} fill="white" className="ml-1" />
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom Custom Controls Bar */}
                {resolvedVideoSrc && !videoError && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-200 ${
                      playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="text-white/80 hover:text-white p-1"
                      aria-label={playing ? 'Pause' : 'Play'}
                    >
                      {playing ? <Pause size={16} /> : <Play size={16} />}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleMute}
                        className="text-white/80 hover:text-white p-1"
                        aria-label={muted ? 'Unmute' : 'Mute'}
                      >
                        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <button
                        onClick={goFullscreen}
                        className="text-white/80 hover:text-white p-1"
                        aria-label="Fullscreen"
                      >
                        <Maximize size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info details */}
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="section-label mb-2">{project.category}</p>
                  <h3
                    id="modal-title"
                    className="display-heading text-2xl md:text-3xl"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    {project.title}
                  </h3>
                </div>
                {project.date && (
                  <span className="text-[#A1A1AA] text-xs font-mono tracking-widest shrink-0 pt-1">
                    {project.date}
                  </span>
                )}
              </div>

              <p className="body-text text-sm mb-6 leading-relaxed">{project.description}</p>

              {project.techniques && project.techniques.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.techniques.map((t) => (
                    <span
                      key={t}
                      className="text-xs tracking-wider px-3 py-1 border border-white/15 text-[#A1A1AA]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {project.externalLink && (
                <a
                  href={project.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center gap-2 text-xs"
                >
                  VIEW ON INSTAGRAM
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
