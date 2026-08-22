import '../styles/PlatformSection.css';

const features = [
  {
    title: 'Secure Role Management',
    desc: 'Tiered access for students, faculty, and administrators with system-enforced boundaries.',
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'LET-Aligned Review Modules',
    desc: 'Content structured around the Licensure Examination for Teachers (LET) coverage areas.',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: 'Progress Tracking',
    desc: 'Students monitor review completion and performance; faculty oversee cohort readiness metrics.',
    icon: (
      <svg viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: 'Timed Assessments',
    desc: 'Simulated exam conditions with controlled time limits to reinforce readiness under pressure.',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

const overviewRows = [
  { label: 'Platform Type', value: 'Web-Based Mock Examination Reviewer System' },
  { label: 'Access Model',  value: 'Role-Based (Mock)' },
  { label: 'Primary Users', value: 'CTE Students & Faculty' },
  { label: 'Institution',   value: 'PRMSU IBA' },
];

const bars = [
  { subject: 'General Education',     pct: 88 },
  { subject: 'Professional Education', pct: 95 },
  { subject: 'Specialization',         pct: 80 },
];

export default function PlatformSection() {
  return (
    <section className="platform-section" id="platform">
      <div className="container">
        <div className="platform-row">
          {/* Left: features */}
          <div>
            <div className="section-label">The Platform</div>
            <h2 className="section-title">EduAssess — Built for Teacher Education</h2>
            <div className="section-rule" />
            <p className="body-text">
              Designed with the needs of pre-service teachers in mind, EduAssess
              delivers a disciplined, distraction-free review environment backed
              by Mock principles.
            </p>

            <div className="platform-features">
              {features.map(({ title, desc, icon }) => (
                <div className="feature-item" key={title}>
                  <div className="feature-icon">{icon}</div>
                  <div className="feature-body">
                    <h4>{title}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual panel */}
          <div className="platform-visual">
            <div className="pv-label">System Overview</div>
            <div className="pv-divider" />

            {overviewRows.map(({ label, value }) => (
              <div className="pv-row" key={label}>
                <span>{label}</span>
                <span>{value}</span>
              </div>
            ))}

            <div className="pv-divider" />

            {bars.map(({ subject, pct }) => (
              <div className="pv-bar-wrap" key={subject}>
                <div className="pv-bar-label">
                  <span>Review Coverage</span>
                  <span>{subject}</span>
                </div>
                <div className="pv-bar-track">
                  <div className="pv-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}

            <div className="pv-divider" />
            <div className="pv-row">
              <span>Access Control</span>
              <span className="pv-status">● Mandatory (Mock)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}