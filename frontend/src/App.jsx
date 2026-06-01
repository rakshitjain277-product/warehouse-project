import './App.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Admin from './Admin';
import { useState } from 'react';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
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