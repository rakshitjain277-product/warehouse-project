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
    window.addEventListener('portfolio-data-updated', fetchProfile);
    return () => window.removeEventListener('portfolio-data-updated', fetchProfile);
  }, []);

  if (!profile) {
    return (
      <section className="min-h-screen theme-section flex justify-center items-center">
        Loading...
      </section>
    );
  }

  return (
    <section className="min-h-screen theme-section flex flex-col items-center px-6 pt-28 pb-20">
      <div
        className="w-full max-w-6xl h-52 md:h-72 rounded-t-xl theme-surface bg-cover bg-center border"
        style={profile.coverImage ? { backgroundImage: `url(${profile.coverImage})` } : undefined}
      ></div>

      <img
        src={profile.image}
        alt="profile"
        className="w-40 h-40 rounded-full object-cover mb-8 border-4 -mt-20"
      />

      <h1 className="text-6xl md:text-7xl font-bold text-center mb-6">
        {profile.name}
      </h1>

      <p className="text-2xl theme-muted mb-6 text-center">
        {profile.title}
      </p>

      <p className="max-w-2xl text-center theme-muted text-lg leading-relaxed">
        {profile.tagline}
      </p>

      <div className="flex gap-4 mt-10">
        <a
          href="#projects"
          className="theme-primary-button px-6 py-3 font-semibold hover:scale-105 transition"
        >
          View Projects
        </a>

        <a
          href={profile.resume}
          target="_blank"
          rel="noreferrer"
          className="theme-outline-button border px-6 py-3 transition"
        >
          Resume
        </a>
      </div>
    </section>
  );
}
