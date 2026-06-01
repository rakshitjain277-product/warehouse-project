export default function Navbar({ onAdminClick }) {
  return (
    <nav className="fixed top-0 w-full bg-black text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="font-bold">Rakshit Jain</h1>

        <div className="flex gap-6 items-center">
          <a href="#home">Home</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
          <button onClick={onAdminClick} className="text-sm px-3 py-1 border rounded">
            Admin
          </button>
        </div>
      </div>
    </nav>
  );
}