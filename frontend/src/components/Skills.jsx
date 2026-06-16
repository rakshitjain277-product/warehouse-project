import { useEffect, useState } from "react";
import { API_URL } from "../config";

export default function Skills() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    function fetchSkills() {
      fetch(`${API_URL}/skills`)
        .then((res) => res.json())
        .then((data) => setSkills(data))
        .catch((err) => console.error(err));
    }
    fetchSkills();
    window.addEventListener("portfolio-data-updated", fetchSkills);
    return () => window.removeEventListener("portfolio-data-updated", fetchSkills);
  }, []);

  return (
    <section className="theme-section-alt py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-14">
          <p
            className="text-xs font-semibold tracking-[0.22em] uppercase mb-3"
            style={{ color: "var(--site-accent)" }}
          >
            Expertise
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">Skills</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 cursor-default"
              style={{
                borderRadius: "var(--site-radius)",
                background:
                  "color-mix(in srgb, var(--site-accent) 9%, var(--site-surface))",
                border:
                  "1px solid color-mix(in srgb, var(--site-accent) 22%, transparent)",
                color: "var(--site-text)",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
