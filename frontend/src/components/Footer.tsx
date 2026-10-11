import { Instagram, Mail, Phone, ArrowUp, Lock } from 'lucide-react';
import { siteConfig } from '../config/portfolio';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export default function Footer({ onOpenAdmin }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#080808] border-t border-white/[0.06] py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Wordmark + tagline */}
          <div>
            <p
              className="text-white font-bold text-lg tracking-tight mb-1"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              SRIRAM<span className="text-[#FF3535]">.</span>
            </p>
            <p className="text-[#A1A1AA] text-xs tracking-[0.25em]"
              style={{ fontFamily: 'Inter, sans-serif' }}>
              EDITED WITH INTENTION. MRCET COLLEGE
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-5">
            <a
              href={siteConfig.contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A1A1AA] hover:text-[#FF3535] transition-colors duration-300 flex items-center gap-1.5 text-xs font-mono"
              aria-label="Instagram"
            >
              <Instagram size={15} />
              <span>{siteConfig.contact.instagramHandle}</span>
            </a>

            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-[#A1A1AA] hover:text-white transition-colors duration-300"
              aria-label="Email"
            >
              <Mail size={16} />
            </a>

            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="text-[#A1A1AA] hover:text-white transition-colors duration-300"
              aria-label="Call"
            >
              <Phone size={15} />
            </a>
          </div>

          {/* Copyright + Admin access + back to top */}
          <div className="flex items-center gap-6">
            <p className="text-[#A1A1AA] text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
              © {year} Sriram.
            </p>

            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-[11px] font-mono text-[#A1A1AA]/60 hover:text-[#FF3535] flex items-center gap-1 transition-colors"
                title="Open Admin Video Manager"
              >
                <Lock size={11} />
                ADMIN
              </button>
            )}

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-8 h-8 border border-white/15 flex items-center justify-center text-[#A1A1AA] hover:text-white hover:border-white/40 transition-all duration-300"
              aria-label="Back to top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
