export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md text-white px-8 py-5 flex justify-between items-center z-50">

      <h1 className="text-2xl font-bold">
        RJ
      </h1>

      <div className="flex gap-6 text-lg">

        <a href="#projects" className="hover:text-gray-400">
          Projects
        </a>

        <a href="#experience" className="hover:text-gray-400">
          Experience
        </a>

        <a href="#contact" className="hover:text-gray-400">
          Contact
        </a>

      </div>
    </nav>
  );
}