import { useState } from "react";
import { API_URL } from "../config";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="theme-section-alt py-24 px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <p
            className="text-xs font-semibold tracking-[0.22em] uppercase mb-3"
            style={{ color: "var(--site-accent)" }}
          >
            Say Hello
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Contact Me</h2>
          <p className="theme-muted text-sm">
            Let's build something amazing together.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className="theme-input"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            className="theme-input"
            required
          />
          <textarea
            name="message"
            rows="5"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            className="theme-input"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full theme-primary-button py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send Message"}
          </button>
        </form>

        {status === "success" && (
          <div
            className="mt-6 p-4 text-sm text-center rounded-xl"
            style={{
              background: "color-mix(in srgb, #22c55e 10%, transparent)",
              border: "1px solid color-mix(in srgb, #22c55e 25%, transparent)",
              color: "#4ade80",
              borderRadius: "var(--site-radius)",
            }}
          >
            Message sent! I'll get back to you soon.
          </div>
        )}

        {status === "error" && (
          <div
            className="mt-6 p-4 text-sm text-center"
            style={{
              background: "color-mix(in srgb, #ef4444 10%, transparent)",
              border: "1px solid color-mix(in srgb, #ef4444 25%, transparent)",
              color: "#f87171",
              borderRadius: "var(--site-radius)",
            }}
          >
            Failed to send. Please try again.
          </div>
        )}
      </div>
    </section>
  );
}
