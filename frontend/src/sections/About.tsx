import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { siteConfig } from '../config/portfolio';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section id="about" ref={ref} className="py-24 md:py-36 bg-[#080808] relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FF3535 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section label */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex items-center gap-3 mb-12"
        >
          <span className="w-8 h-px bg-[#FF3535]" />
          <span className="section-label">01 / THE CREATOR</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — Heading + body */}
          <div>
            <motion.h2
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="display-heading text-[clamp(2rem,5vw,3.5rem)] mb-8 leading-tight"
              style={{ letterSpacing: '-0.03em' }}
            >
              NOT JUST CUTS.<br />
              <span className="text-[#FF3535]">IT'S A FEELING.</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="body-text text-base md:text-lg leading-relaxed mb-6"
            >
              {siteConfig.about.intro}
            </motion.p>

            {/* Academic & Creative Credentials */}
            <motion.div
              variants={fadeUp}
              custom={3}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="flex flex-wrap gap-3 pt-2"
            >
              <div className="border border-white/10 bg-white/[0.03] px-3.5 py-2 rounded text-xs font-mono text-[#A1A1AA]">
                <span className="text-[#FF3535] mr-1.5 font-bold">STUDYING:</span>
                {siteConfig.about.education}
              </div>
              <div className="border border-white/10 bg-white/[0.03] px-3.5 py-2 rounded text-xs font-mono text-[#A1A1AA]">
                <span className="text-[#FF3535] mr-1.5 font-bold">LOCATION:</span>
                {siteConfig.about.location}
              </div>
            </motion.div>
          </div>

          {/* Right — Principles */}
          <div className="space-y-0">
            {siteConfig.about.principles.map((p, i) => (
              <motion.div
                key={p.number}
                variants={fadeUp}
                custom={i + 2}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
              >
                <div className="py-7 border-b border-white/10 group">
                  <div className="flex items-start gap-6">
                    <span className="text-[#FF3535] text-xs font-mono tracking-widest pt-1 shrink-0">
                      {p.number}
                    </span>
                    <div>
                      <h3
                        className="text-white font-semibold tracking-wider text-sm mb-1 group-hover:text-[#FF3535] transition-colors duration-300"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        {p.title}
                      </h3>
                      <p className="text-[#A1A1AA] text-sm">{p.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
