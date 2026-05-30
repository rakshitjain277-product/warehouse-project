const projects = [
  {
    title: "AWS Portfolio Website",
    description:
      "Modern portfolio website deployed using AWS Amplify and EC2.",
    tech: ["React", "Tailwind", "AWS"],
    link: "https://github.com/",
  },
  {
    title: "AI Automation Platform",
    description:
      "Built AI workflows using Python, APIs and automation tools.",
    tech: ["Python", "FastAPI", "OpenAI"],
    link: "https://github.com/",
  },
  {
    title: "Warehouse Management System",
    description:
      "Inventory and warehouse operations dashboard with analytics.",
    tech: ["React", "Python", "PostgreSQL"],
    link: "https://github.com/",
  },
];

export default function Projects() {
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