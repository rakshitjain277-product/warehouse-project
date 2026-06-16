import { useEffect, useState } from "react";
import { API_URL } from "../config";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    function fetchProjects() {
      fetch(`${API_URL}/projects`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => setProjects(data))
        .catch((err) => console.error(err));
    }
    fetchProjects();
    window.addEventListener("portfolio-data-updated", fetchProjects);
    window.addEventListener("focus", fetchProjects);
    return () => {
      window.removeEventListener("portfolio-data-updated", fetchProjects);
      window.removeEventListener("focus", fetchProjects);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedProject]);

  return (
    <section id="projects" className="theme-section-alt py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16">Projects</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="theme-surface border transition duration-300 hover:-translate-y-2 overflow-hidden flex flex-col"
              style={{ borderRadius: "var(--site-radius)" }}
            >
              {project.image && (
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-44 object-cover"
                />
              )}

              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-bold mb-4">{project.title}</h3>

                <p className="theme-muted leading-relaxed mb-6">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech, idx) => (
                    <span key={idx} className="theme-primary-button text-sm px-3 py-1 font-medium">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="inline-block theme-outline-button border px-5 py-2 transition"
                  >
                    View Project
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="theme-surface w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ borderRadius: "var(--site-radius)", border: "1px solid var(--site-accent)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedProject.image && (
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full h-64 object-cover"
                style={{ borderRadius: "var(--site-radius) var(--site-radius) 0 0" }}
              />
            )}

            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-3xl font-bold">{selectedProject.title}</h3>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="theme-muted text-2xl leading-none ml-4 hover:opacity-70"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedProject.tech.map((tech, idx) => (
                  <span key={idx} className="theme-primary-button text-sm px-3 py-1 font-medium">
                    {tech}
                  </span>
                ))}
              </div>

              {selectedProject.writeup ? (
                <p className="theme-muted leading-relaxed whitespace-pre-wrap mb-6">
                  {selectedProject.writeup}
                </p>
              ) : (
                <p className="theme-muted leading-relaxed mb-6">
                  {selectedProject.description}
                </p>
              )}

              {selectedProject.link && (
                <a
                  href={selectedProject.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block theme-outline-button border px-5 py-2 transition"
                >
                  Visit Project
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
