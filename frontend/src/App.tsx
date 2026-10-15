import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Showreel from './sections/Showreel';
import Work from './sections/Work';
import Skills from './sections/Skills';
import Process from './sections/Process';
import Contact from './sections/Contact';
import Footer from './components/Footer';
import AdminModal from './admin/AdminModal';
import CustomCursor from './components/CustomCursor';

function App() {
  const [adminOpen, setAdminOpen] = useState(false);

  // Global shortcut: Ctrl + Shift + A to open Admin Access
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      <CustomCursor />
      <Navbar onOpenAdmin={() => setAdminOpen(true)} />
      <main>
        <Hero />
        <About />
        <Showreel />
        <Work onOpenAdmin={() => setAdminOpen(true)} />
        <Skills />
        <Process />
        <Contact />
      </main>
      <Footer onOpenAdmin={() => setAdminOpen(true)} />

      {/* Admin Panel Modal */}
      <AdminModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  );
}

export default App;
