import './App.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Admin from './Admin';
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
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    fontFamily: theme.fontFamily,
  };

  return (
    <div className="min-h-screen" style={themeStyle}>
      <Navbar onAdminClick={() => setShowAdmin(true)} />

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
  );
}

export default App;
