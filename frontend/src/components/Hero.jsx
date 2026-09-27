// 📁 frontend/src/components/Hero.jsx
import '../styles/Hero.css';

const STATS = [
  { value: '3', label: 'LET Areas Covered' },
  { value: '100%', label: 'Instructor-Curated' },
  { value: '24/7', label: 'Reviewer Access' },
];

const PRMSU_LOGO =
  'https://artificialinteligenceai.com/wp-content/uploads/2026/02/nano-banana-interface-e872fb.png';

const CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets';

// Floating glossy 3D emoji, gracefully hidden if the asset fails to load
// (no lucide fallback needed here since they're purely decorative).
function FloatingIcon({ src, className }) {
  return (
    <img
      src={src}
      alt=""
      className={`hero-float ${className}`}
      draggable="false"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );
}

export default function Hero() {
  return (
    <section className="hero">
      <FloatingIcon src={`${CDN}/Graduation%20cap/3D/graduation_cap_3d.png`} className="float-1" />
      <FloatingIcon src={`${CDN}/Trophy/3D/trophy_3d.png`} className="float-2" />
      <FloatingIcon src={`${CDN}/Memo/3D/memo_3d.png`} className="float-3" />
      <FloatingIcon src={`${CDN}/Check%20mark%20button/3D/check_mark_button_3d.png`} className="float-4" />

      <div className="hero-seal" aria-hidden="true">
        <svg className="hero-seal-ring" viewBox="0 0 200 200">
          <defs>
            <path id="sealRing" d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
          </defs>
          <circle cx="100" cy="100" r="94" className="seal-ring-outer" />
          <circle cx="100" cy="100" r="62" className="seal-ring-inner" />
          <text className="seal-text">
            <textPath href="#sealRing" startOffset="0%">
              PRMSU IBA · COLLEGE OF TEACHER EDUCATION AND COLLEGE OF INDUSTRIAL TECHNOLOGY · EST. REVIEWER SYSTEM ·
            </textPath>
          </text>
        </svg>
        <div className="hero-seal-logo">
          <img src={PRMSU_LOGO} alt="PRMSU seal" />
        </div>
      </div>

      <div className="hero-inner">
        <div className="hero-eyebrow">College of Teacher Education and College of Industrial Technology — PRMSU Iba Campus</div>

        <h1 className="hero-title">
          Structured review.
          <br />
          <em>Informed assessment.</em>
          <br />
          Real exam conditions.
        </h1>

        <p className="hero-subtitle">
          EduAssess is the official web-based LET reviewer of the College of Teacher
          Education and College of Industrial Technology — built to prepare every candidate under the same conditions,
          standards, and rigor as the exam itself.
        </p>

        <div className="hero-ctas">
          <a href="#register" className="btn-primary">Create your account</a>
          <a href="#preview" className="btn-ghost">See the platform</a>
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