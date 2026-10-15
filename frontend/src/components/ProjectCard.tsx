import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { Project } from '../config/portfolio';
import { getVideoFileUrl } from '../admin/indexedDB';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>(project.videoPath || '');

  useEffect(() => {
    let active = true;
    async function resolveMedia() {
      const idb = await getVideoFileUrl(project.id);
      if (idb && active) {
        setVideoSrc(idb);
      } else if (active) {
        setVideoSrc(project.videoPath || '');
      }
    }
    resolveMedia();
    return () => {
      active = false;
    };
  }, [project]);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative group cursor-pointer"
      data-cursor="video"
      data-cursor-text="WATCH"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      onClick={() => onClick(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`Open ${project.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick(project)}
    >
      {/* 9:16 Thumbnail area */}
      <div className="aspect-9-16 relative overflow-hidden bg-[#0d0d0d]">
        {project.thumbnailPath ? (
          <motion.img
            src={project.thumbnailPath}
            alt={project.title}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.04 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            loading="lazy"
          />
        ) : videoSrc ? (
          <video
            src={videoSrc}
            preload="metadata"
            muted
            playsInline
            className="w-full h-full object-cover"
            aria-label={`${project.title} preview`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-3">
              <Play size={16} className="text-white/20 ml-0.5" />
            </div>
            <p className="text-white/25 text-xs text-center px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Add media to<br />
              <code className="text-[#FF3535]">public/videos/</code>
            </p>
          </div>
        )}

        {/* Dark overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: hovered ? 1 : 0.8, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-12 h-12 rounded-full border-2 border-white/60 flex items-center justify-center bg-black/20"
          >
            <Play size={18} fill="white" className="ml-0.5" />
          </motion.div>
        </motion.div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] tracking-[0.2em] text-[#FF3535] bg-black/60 px-2 py-1 backdrop-blur-sm"
            style={{ fontFamily: 'Inter, sans-serif' }}>
            {project.category}
          </span>
        </div>
      </div>

      {/* Card info */}
      <div className="p-4 bg-[#0d0d0d]">
        <h3
          className="text-white font-semibold text-sm tracking-wide mb-1 group-hover:text-[#FF3535] transition-colors duration-300"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {project.title}
        </h3>
        <p className="text-[#A1A1AA] text-xs leading-relaxed line-clamp-2">{project.description}</p>
        {project.date && (
          <p className="text-[#A1A1AA]/50 text-[10px] tracking-widest mt-2">{project.date}</p>
        )}
      </div>
    </motion.div>
  );
}
