import { useState } from "react";
import { API_URL } from "../config";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("Message sent successfully!");

        setForm({
          name: "",
          email: "",
          message: "",
        });
      }
    } catch (error) {
      console.error(error);
      setStatus("Failed to send message");
    }
  };

  return (
    <section className="theme-section py-24 px-6">
      <div className="max-w-3xl mx-auto">

        <h2 className="text-5xl font-bold text-center mb-8">
          Contact Me
        </h2>

        <p className="text-center theme-muted mb-10">
          Let's build something amazing together.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-4 theme-surface border"
            style={{ borderRadius: 'var(--site-radius)' }}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-4 theme-surface border"
            style={{ borderRadius: 'var(--site-radius)' }}
            required
          />

          <textarea
            name="message"
            rows="5"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            className="w-full p-4 theme-surface border"
            style={{ borderRadius: 'var(--site-radius)' }}
            required
          />

          <button
            type="submit"
            className="w-full theme-primary-button py-4 font-semibold hover:opacity-90"
          >
            Send Message
          </button>

        </form>

        {status && (
          <p className="text-center mt-6 text-green-400">
            {status}
          </p>
        )}
      </div>
    </section>
  );
}
