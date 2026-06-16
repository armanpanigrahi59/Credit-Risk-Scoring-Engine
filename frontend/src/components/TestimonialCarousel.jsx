import { useEffect, useState } from "react";

const testimonials = [
  ["Credit committee reviews are now minutes instead of days.", "Maya Iyer, Lending Ops"],
  ["The explanations help underwriters trust every score.", "Jon Bell, Risk Analytics"],
  ["Our API integration was direct, fast, and surprisingly clean.", "Priya Shah, Fintech CTO"]
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % testimonials.length), 3500);
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="testimonials">
      <blockquote>
        "{testimonials[index][0]}"
        <cite>{testimonials[index][1]}</cite>
      </blockquote>
      <div className="dots">
        {testimonials.map((_, dot) => (
          <button key={dot} className={dot === index ? "active" : ""} onClick={() => setIndex(dot)} aria-label={`Show testimonial ${dot + 1}`} />
        ))}
      </div>
    </section>
  );
}
