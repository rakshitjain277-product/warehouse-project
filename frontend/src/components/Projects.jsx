import { useEffect, useState } from "react";
import { API_URL } from "../config";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    function fetchProjects() {
      fetch(`${API_URL}/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error(err));
    }

    fetchProjects();
    window.addEventListener('portfolio-data-updated', fetchProjects);
    return () => window.removeEventListener('portfolio-data-updated', fetchProjects);
  }, []);

  return (
    <section
      id="projects"
      className="theme-section-alt py-24 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16">
          Projects
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="theme-surface p-8 border transition duration-300 hover:-translate-y-2"
              style={{ borderRadius: 'var(--site-radius)' }}
            >
              <h3 className="text-2xl font-bold mb-4">
                {project.title}
              </h3>

              <p className="theme-muted leading-relaxed mb-6">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tech.map((tech, idx) => (
                  <span
                    key={idx}
                    className="theme-primary-button text-sm px-3 py-1 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="inline-block theme-outline-button border px-5 py-2 transition"
              >
                View Project
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
