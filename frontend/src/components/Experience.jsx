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
    window.addEventListener('portfolio-data-updated', fetchExperience);
    return () => window.removeEventListener('portfolio-data-updated', fetchExperience);
  }, []);

  return (
    <section className="theme-section py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <h2 className="text-5xl font-bold text-center mb-20">
          Experience
        </h2>

        <div className="relative border-l ml-4" style={{ borderColor: 'var(--site-muted)' }}>

          {experience.map((item, index) => (
            <div
              key={index}
              className="mb-16 ml-10 relative"
            >

              <div className="absolute -left-[50px] top-2 w-5 h-5 rounded-full" style={{ background: 'var(--site-accent)' }}></div>

              <h3 className="text-2xl font-bold">
                {item.role}
              </h3>

              <p className="text-xl theme-muted mt-1">
                {item.company}
              </p>

              <p className="text-sm theme-muted mt-2 mb-4">
                {item.duration}
              </p>

              <p className="theme-muted leading-relaxed">
                {item.description}
              </p>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
