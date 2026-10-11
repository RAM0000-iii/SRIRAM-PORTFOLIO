import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Instagram, Mail, Phone, MessageSquare, ArrowUpRight, MapPin, GraduationCap } from 'lucide-react';
import { siteConfig } from '../config/portfolio';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section id="contact" ref={ref} className="py-24 md:py-40 bg-[#111111] relative overflow-hidden">
      {/* Large background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(ellipse, #FF3535 0%, transparent 70%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        {/* Section label */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex items-center gap-3 mb-12"
        >
          <span className="w-8 h-px bg-[#FF3535]" />
          <span className="section-label">06 / LET'S CONNECT</span>
        </motion.div>

        {/* Oversized heading */}
        <motion.h2
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="display-heading text-[clamp(2.2rem,6vw,5rem)] mb-6 max-w-3xl"
          style={{ letterSpacing: '-0.03em' }}
        >
          GOT AN IDEA?<br />
          <span className="text-[#FF3535]">LET'S MAKE</span><br />
          IT MOVE.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="body-text text-base mb-10 max-w-lg"
        >
          Have a video project, Instagram Reel concept, or shoot in mind? Let's turn your next idea into something worth watching.
        </motion.p>

        {/* Action Buttons: Email & WhatsApp */}
        <motion.div
          variants={fadeUp}
          custom={3}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex flex-wrap gap-4 mb-16"
        >
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="btn-primary inline-flex items-center gap-3 text-sm"
            aria-label="Start a conversation via email"
          >
            <Mail size={16} />
            SEND AN EMAIL
            <ArrowUpRight size={16} />
          </a>

          {siteConfig.contact.whatsapp && (
            <a
              href={siteConfig.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-3 text-sm hover:border-[#25D366] hover:text-[#25D366]"
              aria-label="Chat on WhatsApp"
            >
              <MessageSquare size={16} />
              CHAT ON WHATSAPP
              <ArrowUpRight size={16} />
            </a>
          )}

          {siteConfig.contact.phone && (
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="btn-secondary inline-flex items-center gap-3 text-sm"
              aria-label="Call Sriram"
            >
              <Phone size={16} />
              {siteConfig.contact.phoneFormatted || siteConfig.contact.phone}
            </a>
          )}
        </motion.div>

        {/* Info Grid */}
        <div className="thin-separator mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Instagram */}
          <motion.a
            variants={fadeUp}
            custom={4}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            href={siteConfig.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 border border-white/10 bg-white/[0.02] hover:border-[#FF3535]/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#FF3535] tracking-widest">INSTAGRAM</span>
              <Instagram size={18} className="text-[#A1A1AA] group-hover:text-[#FF3535] transition-colors" />
            </div>
            <p className="text-white font-bold text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {siteConfig.contact.instagramHandle}
            </p>
            <p className="text-xs text-[#A1A1AA] mt-1 flex items-center gap-1 group-hover:text-white transition-colors">
              Follow for daily edits & reels <ArrowUpRight size={12} />
            </p>
          </motion.a>

          {/* Email & Phone */}
          <motion.div
            variants={fadeUp}
            custom={5}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="p-5 border border-white/10 bg-white/[0.02]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#FF3535] tracking-widest">DIRECT CONTACT</span>
              <Mail size={18} className="text-[#A1A1AA]" />
            </div>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-white hover:text-[#FF3535] font-semibold text-sm transition-colors block break-all"
            >
              {siteConfig.contact.email}
            </a>
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="text-xs text-[#A1A1AA] hover:text-white mt-1.5 flex items-center gap-1.5 transition-colors"
            >
              <Phone size={12} />
              {siteConfig.contact.phoneFormatted}
            </a>
          </motion.div>

          {/* College / Campus */}
          <motion.div
            variants={fadeUp}
            custom={6}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="p-5 border border-white/10 bg-white/[0.02]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#FF3535] tracking-widest">CAMPUS & DEGREE</span>
              <GraduationCap size={18} className="text-[#A1A1AA]" />
            </div>
            <p className="text-white font-semibold text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {siteConfig.contact.college}
            </p>
            <p className="text-xs text-[#A1A1AA] mt-1 flex items-center gap-1.5">
              <MapPin size={12} className="text-[#FF3535]" />
              {siteConfig.contact.course}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
