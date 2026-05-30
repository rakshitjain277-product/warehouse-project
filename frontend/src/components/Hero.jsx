export default function Hero() {
  return (
    <section className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-6">

      <img
        src="/profile.jpg"
        alt="profile"
        className="w-40 h-40 rounded-full object-cover mb-8 border-4 border-white"
      />

      <h1 className="text-6xl md:text-7xl font-bold text-center mb-6">
        Rakshit Jain
      </h1>

      <p className="text-2xl text-gray-400 mb-6 text-center">
        Full Stack Developer • AWS • AI Builder
      </p>

      <p className="max-w-2xl text-center text-gray-500 text-lg leading-relaxed">
        Building scalable applications using React, Python, FastAPI,
        AWS and AI-powered workflows.
      </p>

      <div className="flex gap-4 mt-10">
        <a
          href="#projects"
          className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
        >
          View Projects
        </a>

        <a
          href="/resume.pdf"
          target="_blank"
          className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-black transition"
        >
          Resume
        </a>
      </div>
    </section>
  );
}