import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Plus } from 'lucide-react';
import { siteConfig } from '../config/portfolio';
import type { Project, Category } from '../config/portfolio';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import { getStoredProjects, syncWithBackend } from '../admin/portfolioStorage';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

interface WorkProps {
  onOpenAdmin?: () => void;
}

export default function Work({ onOpenAdmin }: WorkProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const [activeCategory, setActiveCategory] = useState<Category>('ALL WORK');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  useEffect(() => {
    setAllProjects(getStoredProjects());
    syncWithBackend();

    const handleUpdate = () => {
      setAllProjects(getStoredProjects());
    };

    window.addEventListener('portfolio_projects_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_projects_updated', handleUpdate);
  }, []);

  const filteredProjects =
    activeCategory === 'ALL WORK'
      ? allProjects
      : allProjects.filter((p) => p.category === activeCategory);

  return (
    <>
      <section id="work" ref={ref} className="py-24 md:py-36 bg-[#080808] relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Section label */}
          <div className="flex items-center justify-between mb-12">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="flex items-center gap-3"
            >
              <span className="w-8 h-px bg-[#FF3535]" />
              <span className="section-label">03 / SELECTED WORK</span>
            </motion.div>

            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-[11px] font-mono tracking-widest text-white/50 hover:text-[#FF3535] border border-white/10 hover:border-[#FF3535]/50 px-3 py-1.5 transition-all flex items-center gap-1.5"
              >
                <Plus size={12} />
                ADMIN: ADD REEL
              </button>
            )}
          </div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="display-heading text-[clamp(2rem,5vw,3.5rem)] mb-3"
            style={{ letterSpacing: '-0.03em' }}
          >
            MADE TO BE WATCHED.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="body-text text-sm mb-10"
          >
            A collection of edits, experiments, and visual stories.
          </motion.p>

          {/* Category filter */}
          <motion.div
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="flex flex-wrap gap-2 mb-12"
          >
            {siteConfig.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-4 py-2 tracking-widest font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-[#FF3535] text-white'
                    : 'border border-white/15 text-[#A1A1AA] hover:border-white/40 hover:text-white'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Project grid — vertical 9:16 cards */}
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                variants={fadeUp}
                custom={i + 4}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                layout
              >
                <ProjectCard project={project} onClick={setSelectedProject} />
              </motion.div>
            ))}
          </motion.div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-20 border border-dashed border-white/10">
              <p className="text-[#A1A1AA] text-sm mb-4">No projects in this category yet.</p>
              {onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="btn-primary text-xs py-2 px-4"
                >
                  <Plus size={14} /> Add your first reel
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Project detail modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
