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
    window.addEventListener('portfolio-data-updated', fetchSkills);
    return () => window.removeEventListener('portfolio-data-updated', fetchSkills);
  }, []);

  return (
    <section className="theme-section-alt py-24 px-6">

      <div className="max-w-6xl mx-auto text-center">

        <h2 className="text-5xl font-bold mb-16">
          Skills
        </h2>

        <div className="flex flex-wrap justify-center gap-5">

          {skills.map((skill, index) => (
            <div
              key={index}
              className="theme-primary-button px-6 py-3 text-lg font-semibold hover:scale-105 transition"
            >
              {skill}
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
