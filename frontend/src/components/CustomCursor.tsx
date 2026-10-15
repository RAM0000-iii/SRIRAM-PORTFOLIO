import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { Play } from 'lucide-react';

export type CursorMode = 'default' | 'hover' | 'video' | 'text' | 'hidden';

export default function CustomCursor() {
  const [mode, setMode] = useState<CursorMode>('default');
  const [cursorText, setCursorText] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Exact mouse coords (for the center dot)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring physics for the outer ring follower
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const followerX = useSpring(mouseX, springConfig);
  const followerY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Disable on touch / coarse pointer devices
    if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseLeave = () => {
      setIsVisible(false);
      setMode('hidden');
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
      setMode('default');
    };

    // Detect target element under cursor for intelligent context morphing
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Explicit video/reel target
      const videoTrigger = target.closest('[data-cursor="video"]');
      if (videoTrigger) {
        setMode('video');
        setCursorText(videoTrigger.getAttribute('data-cursor-text') || 'PLAY');
        return;
      }

      // 2. Custom text / label target
      const customCursor = target.closest('[data-cursor]');
      if (customCursor) {
        const customType = customCursor.getAttribute('data-cursor');
        if (customType === 'view') {
          setMode('video');
          setCursorText('VIEW');
          return;
        }
      }

      // 3. Form input / editable text
      if (target.closest('input, textarea, [contenteditable="true"]')) {
        setMode('text');
        return;
      }

      // 4. Buttons, links, and clickable items
      const isClickable = target.closest(
        'a, button, [role="button"], input[type="submit"], input[type="button"], .btn-primary, .btn-secondary, [data-clickable="true"]'
      );
      if (isClickable) {
        setMode('hover');
        return;
      }

      // Default state
      setMode('default');
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isVisible, mouseX, mouseY]);

  // Don't render on mobile / touch screen
  if (isTouchDevice) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* 1. Precise Center Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF3535] will-change-transform"
        style={{
          x: mouseX,
          y: mouseY,
          boxShadow: '0 0 10px #FF3535, 0 0 20px rgba(255, 53, 53, 0.6)',
        }}
        animate={{
          opacity: isVisible && mode !== 'hidden' ? 1 : 0,
          scale: mode === 'video' ? 0 : isClicking ? 0.6 : mode === 'hover' ? 1.5 : mode === 'text' ? 0.3 : 1,
          width: mode === 'text' ? '3px' : '8px',
          height: mode === 'text' ? '22px' : '8px',
          borderRadius: mode === 'text' ? '2px' : '9999px',
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      />

      {/* 2. Outer Smooth Follower Ring / Viewfinder */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform flex items-center justify-center"
        style={{
          x: followerX,
          y: followerY,
        }}
        animate={{
          opacity: isVisible && mode !== 'hidden' && mode !== 'text' ? 1 : 0,
          width:
            mode === 'video'
              ? 84
              : mode === 'hover'
              ? 52
              : isClicking
              ? 26
              : 36,
          height:
            mode === 'video'
              ? 84
              : mode === 'hover'
              ? 52
              : isClicking
              ? 26
              : 36,
          scale: isClicking ? 0.85 : 1,
          backgroundColor:
            mode === 'video'
              ? 'rgba(12, 12, 12, 0.85)'
              : mode === 'hover'
              ? 'rgba(255, 53, 53, 0.08)'
              : 'rgba(255, 53, 53, 0.03)',
          borderColor:
            mode === 'video'
              ? '#FF3535'
              : mode === 'hover'
              ? 'rgba(255, 53, 53, 0.9)'
              : 'rgba(255, 53, 53, 0.45)',
          borderWidth: mode === 'video' ? '1.5px' : '1px',
          backdropFilter: mode === 'video' ? 'blur(8px)' : 'none',
          boxShadow:
            mode === 'video'
              ? '0 0 30px rgba(255, 53, 53, 0.4), inset 0 0 15px rgba(255, 53, 53, 0.15)'
              : mode === 'hover'
              ? '0 0 20px rgba(255, 53, 53, 0.25)'
              : '0 0 12px rgba(255, 53, 53, 0.1)',
        }}
        transition={{
          width: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
          height: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
          scale: { duration: 0.15, ease: 'easeOut' },
          opacity: { duration: 0.18 },
          backgroundColor: { duration: 0.2 },
          borderColor: { duration: 0.2 },
        }}
      >
        {/* Reticle Viewfinder crosshair corners on hover */}
        {mode === 'hover' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Top-left tick */}
            <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#FF3535] opacity-80" />
            {/* Bottom-right tick */}
            <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#FF3535] opacity-80" />
          </div>
        )}

        {/* Video Mode: Play triangle and label */}
        {mode === 'video' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center text-white"
          >
            <div className="w-5 h-5 rounded-full bg-[#FF3535] flex items-center justify-center mb-1 shadow-sm">
              <Play size={10} fill="white" className="text-white ml-0.5" />
            </div>
            <span
              className="text-[9px] font-mono tracking-widest font-bold text-white uppercase"
              style={{ letterSpacing: '0.18em' }}
            >
              {cursorText || 'PLAY'}
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
