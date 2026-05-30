const experience = [
  {
    company: "Your Company",
    role: "Software Engineer",
    duration: "2024 - Present",
    description:
      "Building scalable applications using React, Python and cloud technologies."
  },
  {
    company: "Freelance / Personal Projects",
    role: "Full Stack Developer",
    duration: "2023 - 2024",
    description:
      "Worked on automation systems, AI integrations and AWS deployments."
  },
  {
    company: "Learning & Building",
    role: "Self Driven Developer",
    duration: "2022 - 2023",
    description:
      "Explored frontend, backend, databases, APIs and modern web architecture."
  }
];

export default function Experience() {
  return (
    <section className="bg-black text-white py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <h2 className="text-5xl font-bold text-center mb-20">
          Experience
        </h2>

        <div className="relative border-l border-zinc-700 ml-4">

          {experience.map((item, index) => (
            <div
              key={index}
              className="mb-16 ml-10 relative"
            >

              <div className="absolute -left-[50px] top-2 w-5 h-5 rounded-full bg-white"></div>

              <h3 className="text-2xl font-bold">
                {item.role}
              </h3>

              <p className="text-xl text-gray-400 mt-1">
                {item.company}
              </p>

              <p className="text-sm text-gray-500 mt-2 mb-4">
                {item.duration}
              </p>

              <p className="text-gray-400 leading-relaxed">
                {item.description}
              </p>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}