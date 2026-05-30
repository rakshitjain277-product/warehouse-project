const skills = [
  "React",
  "JavaScript",
  "Python",
  "FastAPI",
  "AWS",
  "Tailwind CSS",
  "Git",
  "PostgreSQL",
  "Docker",
  "AI Automation"
];

export default function Skills() {
  return (
    <section className="bg-zinc-950 text-white py-24 px-6">

      <div className="max-w-6xl mx-auto text-center">

        <h2 className="text-5xl font-bold mb-16">
          Skills
        </h2>

        <div className="flex flex-wrap justify-center gap-5">

          {skills.map((skill, index) => (
            <div
              key={index}
              className="bg-white text-black px-6 py-3 rounded-2xl text-lg font-semibold hover:scale-105 transition"
            >
              {skill}
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}