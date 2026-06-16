import { useEffect, useState } from "react";
import { API_URL } from "../config";

export default function Hero() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    function fetchProfile() {
      fetch(`${API_URL}/profile`)
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch((err) => console.error(err));
    }
    fetchProfile();
    window.addEventListener("portfolio-data-updated", fetchProfile);
    return () => window.removeEventListener("portfolio-data-updated", fetchProfile);
  }, []);

  if (!profile) {
    return (
      <section className="min-h-screen theme-section flex justify-center items-center">
        <div className="theme-muted text-sm">Loading...</div>
      </section>
    );
  }

  return (
    <section className="min-h-screen theme-section flex flex-col items-center pt-24 pb-20 px-6 relative overflow-hidden">
      {/* Radial glow behind content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 120% 60% at 50% -5%, color-mix(in srgb, var(--site-accent) 15%, transparent), transparent 70%)",
        }}
      />

      {/* Cover image */}
      <div
        className="w-full max-w-5xl rounded-2xl overflow-hidden relative"
        style={{
          height: "220px",
          background: profile.coverImage
            ? undefined
            : "linear-gradient(135deg, color-mix(in srgb, var(--site-accent) 18%, var(--site-surface)), color-mix(in srgb, var(--site-accent) 4%, var(--site-surface)))",
          border: "1px solid color-mix(in srgb, var(--site-text) 9%, transparent)",
        }}
      >
        {profile.coverImage && (
          <img
            src={profile.coverImage}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        {/* Dot grid overlay (only shown when no cover image) */}
        {!profile.coverImage && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, color-mix(in srgb, var(--site-text) 14%, transparent) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        )}
        {/* Bottom gradient fade into page */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{ background: "linear-gradient(to top, var(--site-bg), transparent)" }}
        />
      </div>

      {/* Profile picture */}
      <div className="relative z-10 -mt-14 mb-6">
        <img
          src={profile.image}
          alt={profile.name}
          className="w-28 h-28 rounded-full object-cover"
          style={{
            border: "3px solid var(--site-bg)",
            boxShadow: "0 0 0 2.5px var(--site-accent)",
          }}
        />
      </div>

      {/* Name */}
      <h1
        className="text-5xl md:text-7xl font-bold text-center mb-4 tracking-tight leading-none"
        style={{
          background:
            "linear-gradient(135deg, var(--site-text) 0%, color-mix(in srgb, var(--site-accent) 65%, var(--site-text)) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {profile.name}
      </h1>

      {/* Title with side lines */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className="h-px w-10 shrink-0"
          style={{ background: "color-mix(in srgb, var(--site-accent) 50%, transparent)" }}
        />
        <p className="text-sm md:text-base font-medium theme-muted text-center">
          {profile.title}
        </p>
        <div
          className="h-px w-10 shrink-0"
          style={{ background: "color-mix(in srgb, var(--site-accent) 50%, transparent)" }}
        />
      </div>

      {/* Company badge */}
      {profile.company && (
        <div
          className="flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: "color-mix(in srgb, var(--site-accent) 10%, var(--site-surface))",
            border: "1px solid color-mix(in srgb, var(--site-accent) 20%, transparent)",
            color: "var(--site-accent)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--site-accent)" }}
          />
          {profile.company}
        </div>
      )}

      {/* Tagline */}
      <p className="max-w-lg text-center theme-muted text-sm md:text-base leading-relaxed mb-10">
        {profile.tagline}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap gap-3 justify-center">
        <a
          href="#projects"
          className="theme-primary-button px-8 py-3 font-semibold hover:scale-105 transition-transform duration-200 text-sm"
        >
          View Projects
        </a>
        <a
          href={profile.resume}
          target="_blank"
          rel="noreferrer"
          className="border px-8 py-3 font-medium text-sm hover:opacity-70 transition-opacity duration-200"
          style={{
            borderColor: "color-mix(in srgb, var(--site-text) 25%, transparent)",
            borderRadius: "var(--site-radius)",
          }}
        >
          Resume ↗
        </a>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30">
        <div className="w-px h-8" style={{ background: "var(--site-text)" }} />
        <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
      </div>
    </section>
  );
}
