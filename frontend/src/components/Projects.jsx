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
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  return (
    <section className="theme-section py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold tracking-[0.22em] uppercase mb-3"
            style={{ color: "var(--site-accent)" }}
          >
            Portfolio
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">Projects</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5"
              style={{
                background: "var(--site-surface)",
                border: "1px solid color-mix(in srgb, var(--site-text) 8%, transparent)",
                borderRadius: "var(--site-radius)",
              }}
            >
              {/* Image area */}
              <div className="relative overflow-hidden" style={{ height: "180px" }}>
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--site-accent) 18%, var(--site-section)), color-mix(in srgb, var(--site-accent) 4%, var(--site-section)))",
                    }}
                  />
                )}
                {/* Gradient overlay so card content reads cleanly */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, var(--site-surface) 0%, transparent 55%)",
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                <p className="theme-muted text-sm leading-relaxed mb-4 flex-1">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {project.tech.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 font-medium"
                      style={{
                        borderRadius: "6px",
                        background:
                          "color-mix(in srgb, var(--site-accent) 9%, transparent)",
                        color: "var(--site-accent)",
                        border:
                          "1px solid color-mix(in srgb, var(--site-accent) 18%, transparent)",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedProject(project)}
                  className="self-start text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 hover:gap-2.5"
                  style={{ color: "var(--site-accent)" }}
                >
                  View Project <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{
              background: "var(--site-surface)",
              borderRadius: "calc(var(--site-radius) + 4px)",
              border:
                "1px solid color-mix(in srgb, var(--site-accent) 22%, transparent)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal image */}
            {selectedProject.image && (
              <div className="relative overflow-hidden" style={{ height: "240px" }}>
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                  style={{
                    borderRadius:
                      "calc(var(--site-radius) + 4px) calc(var(--site-radius) + 4px) 0 0",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, var(--site-surface) 0%, transparent 50%)",
                  }}
                />
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <h3 className="text-2xl md:text-3xl font-bold leading-tight">
                  {selectedProject.title}
                </h3>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center text-lg hover:opacity-60 transition-opacity"
                  style={{
                    background:
                      "color-mix(in srgb, var(--site-text) 10%, transparent)",
                    color: "var(--site-text)",
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {selectedProject.tech.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 font-medium"
                    style={{
                      borderRadius: "6px",
                      background:
                        "color-mix(in srgb, var(--site-accent) 9%, transparent)",
                      color: "var(--site-accent)",
                      border:
                        "1px solid color-mix(in srgb, var(--site-accent) 18%, transparent)",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div
                className="mb-6 h-px"
                style={{
                  background:
                    "color-mix(in srgb, var(--site-text) 8%, transparent)",
                }}
              />

              {/* Writeup */}
              <p className="theme-muted text-sm leading-relaxed whitespace-pre-wrap mb-6">
                {selectedProject.writeup || selectedProject.description}
              </p>

              {/* Link */}
              {selectedProject.link && (
                <a
                  href={selectedProject.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "var(--site-accent)" }}
                >
                  Visit Project ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
