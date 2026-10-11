import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { siteConfig } from '../config/portfolio';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section id="skills" ref={ref} className="py-24 md:py-36 bg-[#111111] relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full opacity-[0.04] pointer-events-none"
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
          <span className="section-label">04 / THE CRAFT</span>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="display-heading text-[clamp(2rem,5vw,3.5rem)] mb-16"
          style={{ letterSpacing: '-0.03em' }}
        >
          THE CRAFT<br />
          <span className="text-[#FF3535]">BEHIND THE CUT.</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {siteConfig.skills.map((skill, i) => (
            <motion.div
              key={skill.number}
              variants={fadeUp}
              custom={i + 2}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="group py-8 px-6 border-b border-white/10 border-r border-white/10 [&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0"
              >
              <div className="flex items-start gap-4">
                <span
                  className="text-[#FF3535] text-3xl font-bold leading-none shrink-0"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {skill.number}
                </span>
                <div>
                  <h3
                    className="text-white font-semibold tracking-wider text-sm mb-2 group-hover:text-[#FF3535] transition-colors duration-300"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {skill.title}
                  </h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">{skill.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
