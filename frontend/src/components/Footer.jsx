export default function Footer() {
  return (
    <footer
      className="py-12 px-6"
      style={{
        background: "var(--site-section)",
        borderTop: "1px solid color-mix(in srgb, var(--site-text) 7%, transparent)",
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-bold text-base mb-0.5">Rakshit Jain</p>
          <p className="theme-muted text-xs">
            Product Manager · Supply Chain Technology
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm theme-muted">
          <a
            href="https://linkedin.com/in/rakshitjain"
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-100 transition-opacity"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/rakshitjain277-product"
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-100 transition-opacity"
          >
            GitHub
          </a>
          <a
            href="mailto:rakshit.jain@apollosupplychain.com"
            className="hover:opacity-100 transition-opacity"
          >
            Email
          </a>
        </div>
      </div>

      <div
        className="max-w-6xl mx-auto mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{
          borderTop:
            "1px solid color-mix(in srgb, var(--site-text) 6%, transparent)",
        }}
      >
        <p className="text-xs theme-muted">© 2026 Rakshit Jain. All rights reserved.</p>
        <p className="text-xs theme-muted">Built with Claude AI</p>
      </div>
    </footer>
  );
}
