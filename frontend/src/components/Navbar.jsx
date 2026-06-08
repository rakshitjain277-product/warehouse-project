export default function Navbar({ onAdminClick }) {
  return (
    <nav className="fixed top-0 w-full p-3 md:p-4 z-40 theme-nav">
      <div className="max-w-7xl mx-auto flex justify-center md:justify-end items-center">
        <div className="flex gap-3 md:gap-6 items-center overflow-x-auto max-w-full text-sm md:text-base whitespace-nowrap">
          <a href="#home">Home</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
          <button type="button" onClick={onAdminClick} className="text-sm px-3 py-1 border theme-button">
            Admin
          </button>
        </div>
      </div>
    </nav>
  );
}
