import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Lock } from 'lucide-react';

const navLinks = [
  { label: 'ABOUT', href: '#about' },
  { label: 'WORK', href: '#work' },
  { label: 'SKILLS', href: '#skills' },
  { label: 'CONTACT', href: '#contact' },
];

interface NavbarProps {
  onOpenAdmin?: () => void;
}

export default function Navbar({ onOpenAdmin }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#080808]/90 backdrop-blur-md border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          {/* Wordmark */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-white font-bold tracking-tight text-xl hover:text-[#FF3535] transition-colors duration-300"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            aria-label="Go to top"
          >
            SRIRAM<span className="text-[#FF3535]">.</span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className="text-[#A1A1AA] hover:text-white text-xs tracking-[0.2em] font-medium transition-colors duration-300 relative group"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#FF3535] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}

            {/* Admin Access button */}
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="border border-white/15 hover:border-[#FF3535] text-[#A1A1AA] hover:text-[#FF3535] px-2.5 py-1 text-[10px] font-mono tracking-widest transition-all flex items-center gap-1.5 rounded-sm"
                title="Admin Access (Upload & Manage Videos)"
              >
                <Lock size={11} />
                ADMIN
              </button>
            )}
          </div>

          {/* Mobile menu toggle & quick admin */}
          <div className="md:hidden flex items-center gap-3">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-[#A1A1AA] hover:text-[#FF3535] p-1.5 border border-white/15"
                title="Admin Portal"
              >
                <Lock size={14} />
              </button>
            )}
            <button
              className="text-white p-2 -mr-2"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#080808]/97 flex flex-col items-center justify-center gap-8 pt-16"
          >
            {navLinks.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => handleNav(link.href)}
                className="text-white text-3xl font-bold tracking-widest hover:text-[#FF3535] transition-colors duration-200"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {link.label}
              </motion.button>
            ))}

            {onOpenAdmin && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAdmin();
                }}
                className="text-xs font-mono tracking-widest text-[#FF3535] border border-[#FF3535]/40 px-4 py-2 mt-4 flex items-center gap-2"
              >
                <Lock size={14} />
                OPEN ADMIN ACCESS
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
