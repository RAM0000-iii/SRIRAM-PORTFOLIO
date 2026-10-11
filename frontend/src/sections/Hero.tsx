import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { siteConfig } from '../config/portfolio';

export default function Hero() {
  const avatarRef = useRef<HTMLDivElement>(null);
  const [avatarExists, setAvatarExists] = useState<boolean | null>(null);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Mouse-responsive tilt values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 60, damping: 20, mass: 0.8 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Check avatar
  useEffect(() => {
    const img = new Image();
    img.onload = () => setAvatarExists(true);
    img.onerror = () => setAvatarExists(false);
    img.src = siteConfig.avatarPath;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col overflow-hidden bg-[#080808]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #FF3535 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute left-0 bottom-0 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #FF3535 0%, transparent 70%)',
          }}
        />
        {/* Subtle grain */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center max-w-7xl mx-auto w-full px-6 lg:px-12 pt-24 pb-16">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-0">

          {/* Left — Text */}
          <div className="relative z-10 order-2 lg:order-1">
            {/* Editorial label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="w-8 h-px bg-[#FF3535]" />
              <span className="section-label">{siteConfig.tagline}</span>
            </motion.div>

            {/* Giant SRIRAM */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden mb-2"
            >
              <h1
                className="display-heading text-[clamp(4rem,12vw,9rem)] leading-none tracking-tight"
                style={{ letterSpacing: '-0.04em' }}
              >
                SRIRAM
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="text-[clamp(1rem,2.5vw,1.4rem)] font-semibold text-white/90 leading-tight mb-4 max-w-lg"
              style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.01em' }}
            >
              TURNING IDEAS INTO<br />
              <span className="text-[#FF3535]">SCROLL-STOPPING</span> STORIES.
            </motion.p>

            {/* Supporting text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="body-text text-sm md:text-base max-w-md mb-10"
            >
              {siteConfig.subheadline}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => scrollTo('#work')}
                className="btn-primary"
                aria-label="View my edits"
              >
                VIEW MY EDITS
                <ArrowDown size={14} />
              </button>
              <button
                onClick={() => scrollTo('#contact')}
                className="btn-secondary"
                aria-label="Let's connect"
              >
                LET'S CONNECT
              </button>
            </motion.div>
          </div>

          {/* Right — Avatar */}
          <motion.div
            ref={avatarRef}
            className="order-1 lg:order-2 flex justify-center lg:justify-end relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={!prefersReduced ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : {}}
          >
            {/* Red glow behind avatar */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 60% 80% at 50% 60%, rgba(255,53,53,0.22) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />

            {/* Avatar image */}
            <motion.div
              animate={!prefersReduced ? { y: [0, -12, 0] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[460px] xl:max-w-[520px]"
            >
              {avatarExists === false ? (
                // Fallback when avatar is missing
                <div className="aspect-[3/4] border border-dashed border-white/20 flex flex-col items-center justify-center text-center p-8 rounded-lg">
                  <div className="text-[#FF3535] text-4xl mb-4">📁</div>
                  <p className="text-white/60 text-sm mb-2 font-mono">Avatar not found</p>
                  <p className="text-white/40 text-xs">
                    Place your avatar at:<br />
                    <code className="text-[#FF3535]">public/images/sriram-3d.png.png</code>
                  </p>
                </div>
              ) : avatarExists === true ? (
                <img
                  src={siteConfig.avatarPath}
                  alt="Sriram — Video Editor"
                  className="w-full h-auto object-contain select-none"
                  style={{ maxHeight: '80vh' }}
                  draggable={false}
                />
              ) : null}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex justify-center pb-8"
      >
        <motion.button
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          onClick={() => scrollTo('#about')}
          className="text-white/30 hover:text-white/60 transition-colors"
          aria-label="Scroll down"
        >
          <ArrowDown size={20} />
        </motion.button>
      </motion.div>
    </section>
  );
}
