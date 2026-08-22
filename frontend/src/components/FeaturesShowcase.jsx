import { Timer, BookOpenCheck, ShieldCheck, BarChart3, Users2 } from 'lucide-react';
import '../styles/FeaturesShowcase.css';

export default function FeaturesShowcase() {
  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="features-header">
          <div className="section-label">Inside the Platform</div>
          <h2 className="section-title">One System, Built for the LET</h2>
          <div className="section-rule" />
          <p className="body-text" style={{ margin: '0 auto' }}>
            Every tool here maps to a real part of LET preparation — not a generic
            quiz builder repurposed for education.
          </p>
        </div>

        <div className="features-grid">

          {/* Flagship — LET Simulation */}
          <div className="feature-card f-large">
            <div className="feature-icon"><Timer size={20} strokeWidth={1.6} /></div>
            <h3>Full LET Simulation</h3>
            <p>
              Timed GenEd, ProfEd, and Major exams that run under real exam conditions —
              countdown warnings at 30, 10, and 5 minutes, and automatic submission the
              moment time expires.
            </p>
            <div className="feature-stats">
              <span>150 items</span>
              <span>3 hours</span>
              <span>Auto-submit</span>
            </div>
          </div>

          {/* Tall — Analytics */}
          <div className="feature-card f-tall">
            <div className="feature-icon"><BarChart3 size={20} strokeWidth={1.6} /></div>
            <h3>Per-Subject Analytics</h3>
            <p>
              Every attempt is broken down by subject, so you know exactly where to
              focus — not just one overall percentage.
            </p>
            <div className="feature-bars">
              {[
                { label: 'GenEd', pct: 82 },
                { label: 'ProfEd', pct: 68 },
                { label: 'Major', pct: 74 },
              ].map(({ label, pct }) => (
                <div className="feature-bar-row" key={label}>
                  <span>{label}</span>
                  <div className="feature-bar-track">
                    <div className="feature-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="feature-bar-pct">{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="feature-card f-c1">
            <div className="feature-icon"><BookOpenCheck size={19} strokeWidth={1.6} /></div>
            <h3>Instructor-Curated Bank</h3>
            <p>Every item written and reviewed by CTE faculty — tagged by subject, difficulty, and paired with an explanation.</p>
          </div>

          <div className="feature-card f-c2">
            <div className="feature-icon"><ShieldCheck size={19} strokeWidth={1.6} /></div>
            <h3>Role-Based Access</h3>
            <p>Separate Admin, Instructor, and Student portals — each sees only what their role is permitted to control.</p>
          </div>

          <div className="feature-card f-c3">
            <div className="feature-icon"><Users2 size={19} strokeWidth={1.6} /></div>
            <h3>Class-Wide Monitoring</h3>
            <p>Instructors track cohort performance and flag weak topics; students download reviewers as they're published.</p>
          </div>

        </div>
      </div>
    </section>
  );
}