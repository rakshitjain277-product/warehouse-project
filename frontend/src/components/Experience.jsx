import { useEffect, useState } from "react";
import { API_URL } from "../config";

export default function Experience() {
  const [experience, setExperience] = useState([]);

  useEffect(() => {
    function fetchExperience() {
      fetch(`${API_URL}/experience`)
        .then((res) => res.json())
        .then((data) => setExperience(data))
        .catch((err) => console.error(err));
    }
    fetchExperience();
    window.addEventListener("portfolio-data-updated", fetchExperience);
    return () => window.removeEventListener("portfolio-data-updated", fetchExperience);
  }, []);

  return (
    <section className="theme-section py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold tracking-[0.22em] uppercase mb-3"
            style={{ color: "var(--site-accent)" }}
          >
            Career
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">Experience</h2>
        </div>

        <div className="space-y-5">
          {experience.map((item, index) => (
            <div key={index} className="flex gap-5 group">
              {/* Step number with connecting line */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "var(--site-surface)",
                    border: "2px solid color-mix(in srgb, var(--site-accent) 35%, transparent)",
                    color: "var(--site-accent)",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                {index < experience.length - 1 && (
                  <div
                    className="w-px flex-1 mt-2"
                    style={{
                      background:
                        "color-mix(in srgb, var(--site-accent) 18%, transparent)",
                      minHeight: "24px",
                    }}
                  />
                )}
              </div>

              {/* Card */}
              <div
                className="flex-1 p-6 mb-5 transition-all duration-300 group-hover:-translate-y-0.5"
                style={{
                  background: "var(--site-surface)",
                  border: "1px solid color-mix(in srgb, var(--site-text) 8%, transparent)",
                  borderRadius: "var(--site-radius)",
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold leading-snug">{item.role}</h3>
                    <p className="theme-muted text-sm mt-0.5">{item.company}</p>
                  </div>
                  <span
                    className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{
                      background:
                        "color-mix(in srgb, var(--site-accent) 12%, transparent)",
                      color: "var(--site-accent)",
                    }}
                  >
                    {item.duration}
                  </span>
                </div>
                <p className="theme-muted text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
