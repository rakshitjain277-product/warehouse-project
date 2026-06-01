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
      className="bg-zinc-950 text-white py-24 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16">
          Projects
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 hover:border-white transition duration-300 hover:-translate-y-2"
            >
              <h3 className="text-2xl font-bold mb-4">
                {project.title}
              </h3>

              <p className="text-gray-400 leading-relaxed mb-6">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tech.map((tech, idx) => (
                  <span
                    key={idx}
                    className="bg-white text-black text-sm px-3 py-1 rounded-full font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-white border border-white px-5 py-2 rounded-xl hover:bg-white hover:text-black transition"
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
