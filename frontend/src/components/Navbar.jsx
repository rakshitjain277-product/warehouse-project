export default function Navbar({ onAdminClick, onSupplyChainClick }) {
  return (
    <nav
      className="fixed top-0 w-full z-40"
      style={{
        background: "color-mix(in srgb, var(--site-bg) 75%, transparent)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid color-mix(in srgb, var(--site-text) 8%, transparent)",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <a
            href="#home"
            className="font-bold text-base tracking-tight hover:opacity-80 transition-opacity"
          >
            Rakshit Jain
          </a>
          <div style={{ width: 1, height: 18, background: 'color-mix(in srgb, var(--site-text) 18%, transparent)' }} />
          <button
            type="button"
            onClick={onSupplyChainClick}
            style={{
              background: 'none',
              border: '1px solid rgba(255,107,43,0.35)',
              color: '#ff6b2b',
              borderRadius: 8,
              padding: '4px 12px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,43,0.1)'; e.currentTarget.style.borderColor = '#ff6b2b'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(255,107,43,0.35)'; }}
          >
            Supply Chain ›
          </button>
        </div>

        <div className="flex items-center gap-5 md:gap-7 text-sm">
          <a href="#experience" className="theme-muted hover:opacity-100 transition-opacity duration-200 hidden md:block">
            Experience
          </a>
          <a href="#skills" className="theme-muted hover:opacity-100 transition-opacity duration-200 hidden md:block">
            Skills
          </a>
          <a href="#projects" className="theme-muted hover:opacity-100 transition-opacity duration-200 hidden md:block">
            Projects
          </a>
          <a href="#contact" className="theme-muted hover:opacity-100 transition-opacity duration-200 hidden md:block">
            Contact
          </a>
          <a
            href="#contact"
            className="theme-primary-button px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity hidden sm:block"
          >
            Get in Touch
          </a>
          <button
            type="button"
            onClick={onAdminClick}
            className="text-xs theme-muted hover:opacity-60 transition-opacity"
            style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}
          >
            ADMIN
          </button>
        </div>
      </div>
    </nav>
  );
}
