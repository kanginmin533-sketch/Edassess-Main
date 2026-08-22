import '../styles/Hero.css';

const STATS = [
  { value: '3', label: 'LET Areas Covered' },
  { value: '100%', label: 'Instructor-Curated' },
  { value: '24/7', label: 'Reviewer Access' },
];

const PRMSU_LOGO =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9cHG9emrweMing6rkz9MB4Bo-wzZUsM8azA&s';

// Simple laurel branch: a column of leaves along the y-axis, then rotated/
// mirrored per instance to build a wreath-like flourish behind the hero copy.
function LaurelBranch({ mirror = false }) {
  const leaves = Array.from({ length: 11 });
  return (
    <g transform={mirror ? 'scale(-1,1)' : undefined}>
      {leaves.map((_, i) => {
        const t = i / (leaves.length - 1);
        const y = 20 + t * 300;
        const spread = 10 + t * 34;
        const angle = -18 - t * 46;
        return (
          <ellipse
            key={i}
            cx={spread}
            cy={y}
            rx="16"
            ry="7"
            transform={`rotate(${angle} ${spread} ${y})`}
          />
        );
      })}
    </g>
  );
}

export default function Hero() {
  return (
    <section className="hero">

      {/* Ornamental laurel — decorative only, sits behind all content */}
      <svg className="hero-bg-ornament" viewBox="0 0 620 360" aria-hidden="true">
        <g transform="translate(20, 30)">
          <LaurelBranch />
        </g>
        <g transform="translate(600, 30)">
          <LaurelBranch mirror />
        </g>
      </svg>

      {/* Seal — rotating institutional ring with static logo at center */}
      <div className="hero-seal" aria-hidden="true">
        <svg className="hero-seal-ring" viewBox="0 0 200 200">
          <defs>
            <path id="sealRing" d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
          </defs>
          <circle cx="100" cy="100" r="94" className="seal-ring-outer" />
          <circle cx="100" cy="100" r="62" className="seal-ring-inner" />
          <text className="seal-text">
            <textPath href="#sealRing" startOffset="0%">
              PRMSU IBA · COLLEGE OF TEACHER EDUCATION · EST. REVIEWER SYSTEM ·
            </textPath>
          </text>
        </svg>
        <div className="hero-seal-logo">
          <img src={PRMSU_LOGO} alt="PRMSU seal" />
        </div>
      </div>

      <div className="hero-inner">
        <div className="hero-eyebrow">College of Teacher Education — PRMSU Iba Campus</div>

        <h1 className="hero-title">
          Structured Review.
          <br />
          <em>Informed Assessment.</em>
          <br />
          Real Exam Conditions.
        </h1>

        <p className="hero-subtitle">
          EduAssess is the official web-based LET reviewer of the College of Teacher
          Education — built to prepare every candidate under the same conditions,
          standards, and rigor as the exam itself.
        </p>

        <div className="hero-ctas">
          <a href="#register" className="btn-primary">Create Your Account</a>
          <a href="#preview" className="btn-ghost">
            See the Platform <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <div className="hero-stats">
        {STATS.map(({ value, label }, i) => (
          <div className="hero-stat" key={label}>
            {i > 0 && <span className="hero-stat-divider" aria-hidden="true" />}
            <div className="hero-stat-value">{value}</div>
            <div className="hero-stat-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}