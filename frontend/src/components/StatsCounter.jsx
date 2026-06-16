import { useEffect, useRef, useState } from "react";

export default function StatsCounter({ value, suffix = "", label }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let frame = 0;
      const timer = setInterval(() => {
        frame += 1;
        setCount(Math.round((value * frame) / 36));
        if (frame >= 36) clearInterval(timer);
      }, 24);
      observer.disconnect();
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="stat" ref={ref}>
      <strong>{count}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}
