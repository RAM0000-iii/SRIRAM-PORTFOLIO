import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, Volume2, VolumeX, Maximize } from 'lucide-react';
import { siteConfig } from '../config/portfolio';

export default function Showreel() {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const hasVideo = Boolean(siteConfig.showreel.videoPath);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
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
    const v = videoRef.current;
    if (v && v.requestFullscreen) v.requestFullscreen();
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <section
      id="showreel"
      ref={ref}
      className="py-24 md:py-36 bg-[#111111] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section label */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex items-center gap-3 mb-12"
        >
          <span className="w-8 h-px bg-[#FF3535]" />
          <span className="section-label">02 / THE SHOWREEL</span>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="display-heading text-[clamp(1.8rem,4vw,3rem)] mb-4"
          style={{ letterSpacing: '-0.03em' }}
        >
          A FEW SECONDS.<br />
          <span className="text-[#FF3535]">A WHOLE STORY.</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="body-text text-sm mb-12 max-w-lg"
        >
          {siteConfig.showreel.description}
        </motion.p>

        {/* Video container */}
        <motion.div
          variants={fadeUp}
          custom={3}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="relative w-full max-w-4xl mx-auto"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {hasVideo ? (
            <div
              className="relative aspect-16-9 bg-[#080808] cursor-pointer group"
              data-cursor="video"
              data-cursor-text={playing ? 'PAUSE' : 'PLAY'}
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src={siteConfig.showreel.videoPath}
                poster={siteConfig.showreel.posterPath || undefined}
                preload="metadata"
                muted
                playsInline
                className="w-full h-full object-cover"
                onEnded={() => setPlaying(false)}
                aria-label="Showreel video"
              />

              {/* Overlay */}
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/60 flex items-center justify-center backdrop-blur-sm bg-white/10"
                >
                  <Play size={28} fill="white" className="ml-1" />
                </motion.div>
              </div>

              {/* Controls bar */}
              <div className={`absolute bottom-0 left-0 right-0 flex items-center gap-3 p-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <span className="section-label text-white/60">{siteConfig.showreel.caption}</span>
                <div className="ml-auto flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label={muted ? 'Unmute' : 'Mute'}
                  >
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <button
                    onClick={goFullscreen}
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="Fullscreen"
                  >
                    <Maximize size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Placeholder when no showreel is configured */
            <div className="aspect-16-9 bg-[#080808] flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-6">
                <Play size={24} className="text-white/30 ml-1" />
              </div>
              <p className="text-white/50 text-sm mb-2 font-medium tracking-wider" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                SHOWREEL COMING SOON
              </p>
              <p className="text-white/30 text-xs max-w-xs">
                Add your showreel video to{' '}
                <code className="text-[#FF3535]">public/videos/showreel.mp4</code>{' '}
                and update <code className="text-[#FF3535]">src/config/portfolio.ts</code>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
