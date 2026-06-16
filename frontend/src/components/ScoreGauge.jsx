export default function ScoreGauge({ score = 720, label = "LOW", size = "large" }) {
  const normalized = Math.max(0, Math.min(1, (score - 300) / 550));
  const rotation = -118 + normalized * 236;
  return (
    <div className={`score-gauge ${size}`}>
      <svg viewBox="0 0 240 150" role="img" aria-label={`Credit score ${score}`}>
        <path className="zone red" d="M30 125a90 90 0 0 1 60-85" />
        <path className="zone amber" d="M90 40a90 90 0 0 1 60 0" />
        <path className="zone green" d="M150 40a90 90 0 0 1 60 85" />
        <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "120px 125px" }}>
          <line className="needle" x1="120" y1="125" x2="120" y2="46" />
        </g>
        <circle cx="120" cy="125" r="8" fill="#111827" />
      </svg>
      <strong>{score}</strong>
      <span>{label} RISK</span>
    </div>
  );
}
