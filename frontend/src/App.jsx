import './App.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Admin from './Admin';
import ParallaxBackground from './components/ParallaxBackground';
import SupplyChain from './pages/SupplyChain';
import { useEffect, useState } from 'react';
import { API_URL } from './config';

const defaultTheme = {
  backgroundColor: '#000000',
  sectionColor: '#09090b',
  surfaceColor: '#18181b',
  textColor: '#ffffff',
  mutedTextColor: '#a1a1aa',
  accentColor: '#ffffff',
  fontFamily: 'Inter, Arial, sans-serif',
  buttonRadius: '12',
};

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSupplyChain, setShowSupplyChain] = useState(false);
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    function fetchTheme() {
      fetch(`${API_URL}/theme`)
        .then((res) => res.json())
        .then((data) => setTheme({ ...defaultTheme, ...data }))
        .catch((err) => console.error(err));
    }

    function applyTheme(event) {
      if (event.detail?.theme) {
        setTheme({ ...defaultTheme, ...event.detail.theme });
      }
    }

    fetchTheme();
    window.addEventListener('portfolio-data-updated', fetchTheme);
    window.addEventListener('portfolio-theme-updated', applyTheme);
    return () => {
      window.removeEventListener('portfolio-data-updated', fetchTheme);
      window.removeEventListener('portfolio-theme-updated', applyTheme);
    };
  }, []);

  const themeStyle = {
    '--site-bg': theme.backgroundColor,
    '--site-section': theme.sectionColor,
    '--site-surface': theme.surfaceColor,
    '--site-text': theme.textColor,
    '--site-muted': theme.mutedTextColor,
    '--site-accent': theme.accentColor,
    '--site-radius': `${theme.buttonRadius}px`,
    // No backgroundColor here — sections own their backgrounds so the
    // fixed parallax layer shows through their semi-transparent surfaces.
    color: theme.textColor,
    fontFamily: theme.fontFamily,
  };

  if (showSupplyChain) {
    return <SupplyChain onClose={() => setShowSupplyChain(false)} />;
  }

  return (
    // Outer div: only sets CSS variables — no position/z-index so it does NOT
    // create a stacking context, letting the fixed ParallaxBackground live in
    // the root stacking context (z-index 0) while content sits at z-index 1.
    <div style={themeStyle}>
      <ParallaxBackground />

      <div
        className="min-h-screen"
        style={{ position: 'relative', zIndex: 1, color: theme.textColor, fontFamily: theme.fontFamily }}
      >
        <Navbar onAdminClick={() => setShowAdmin(true)} onSupplyChainClick={() => setShowSupplyChain(true)} />

        <main>
          <section id="home">
            <Hero />
          </section>

          <section id="experience">
            <Experience />
          </section>

          <section id="skills">
            <Skills />
          </section>

          <section id="projects">
            <Projects />
          </section>

          <section id="contact">
            <Contact />
          </section>
        </main>

        <Footer />

        {showAdmin && <Admin onClose={() => setShowAdmin(false)} />}
      </div>
    </div>
  );
}

export default App;
