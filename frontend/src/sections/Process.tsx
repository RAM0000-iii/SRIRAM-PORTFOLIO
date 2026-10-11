import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { siteConfig } from '../config/portfolio';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section id="process" ref={ref} className="py-24 md:py-36 bg-[#080808] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section label */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex items-center gap-3 mb-12"
        >
          <span className="w-8 h-px bg-[#FF3535]" />
          <span className="section-label">05 / THE PROCESS</span>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="display-heading text-[clamp(2rem,5vw,3.5rem)] mb-20"
          style={{ letterSpacing: '-0.03em' }}
        >
          FROM RAW<br />
          <span className="text-[#FF3535]">TO REFINED.</span>
        </motion.h2>

        {/* Process steps — timeline style */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-6 left-6 right-6 h-px bg-white/10" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {siteConfig.process.map((step, i) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                custom={i + 2}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className="relative lg:px-6 first:pl-0 last:pr-0"
              >
                {/* Step number dot */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 border border-[#FF3535]/40 flex items-center justify-center bg-[#080808]">
                      <span
                        className="text-[#FF3535] text-sm font-bold tracking-wider"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        {step.number}
                      </span>
                    </div>
                  </div>
                  {/* Connector (mobile/tablet) */}
                  {i < siteConfig.process.length - 1 && (
                    <div className="lg:hidden flex-1 h-px bg-white/10" />
                  )}
                </div>

                <h3
                  className="text-white font-semibold text-sm tracking-wider mb-3"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {step.title}
                </h3>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
