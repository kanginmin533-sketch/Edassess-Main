// 📁 frontend/src/components/FeaturesShowcase.jsx
import { Timer, BookOpenCheck, ShieldCheck, BarChart3, Users2 } from 'lucide-react';
import Icon3D from './Icon3D';
import '../styles/FeaturesShowcase.css';

const CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets';

export default function FeaturesShowcase() {
  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="features-header">
          <div className="section-label">Inside the platform</div>
          <h2 className="section-title">One system, built for the LET</h2>
          <div className="section-rule" />
          <p className="body-text" style={{ margin: 0 }}>
            Every tool here maps to a real part of LET preparation — not a generic
            quiz builder repurposed for education.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card f-large card-glossy accent-blue">
            <Icon3D src={`${CDN}/Alarm%20clock/3D/alarm_clock_3d.png`} fallback={Timer} tone="blue" alt="" />
            <h3>Full LET simulation</h3>
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

          <div className="feature-card f-tall card-glossy accent-violet">
            <Icon3D src={`${CDN}/Bar%20chart/3D/bar_chart_3d.png`} fallback={BarChart3} tone="violet" alt="" />
            <h3>Per-subject analytics</h3>
            <p>
              Every attempt is broken down by subject, so you know exactly where to
              focus — not just one overall percentage.
            </p>
            <div className="feature-bars">
              {[
                { label: 'GenEd', pct: 75, color: 'blue' },
                { label: 'ProfEd', pct: 82, color: 'violet' },
                { label: 'Major', pct: 74, color: 'amber' },
              ].map(({ label, pct, color }) => (
                <div className="feature-bar-row" key={label}>
                  <span>{label}</span>
                  <div className="feature-bar-track">
                    <div className={`feature-bar-fill bar-${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="feature-bar-pct">{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="feature-card f-c1 card-glossy accent-amber">
            <Icon3D src={`${CDN}/Open%20book/3D/open_book_3d.png`} fallback={BookOpenCheck} tone="amber" alt="" size={38} />
            <h3>Instructor-curated bank</h3>
            <p>Every item written and reviewed by CTE and CIT faculty — tagged by subject, difficulty, and paired with an explanation.</p>
          </div>

          <div className="feature-card f-c2 card-glossy accent-teal">
            <Icon3D src={`${CDN}/Shield/3D/shield_3d.png`} fallback={ShieldCheck} tone="teal" alt="" size={38} />
            <h3>Role-based access</h3>
            <p>Separate admin, instructor, and student portals — each sees only what their role is permitted to control.</p>
          </div>

          <div className="feature-card f-c3 card-glossy accent-coral">
            <Icon3D src={`${CDN}/Busts%20in%20silhouette/3D/busts_in_silhouette_3d.png`} fallback={Users2} tone="coral" alt="" size={38} />
            <h3>Class-wide monitoring</h3>
            <p>Instructors track cohort performance and flag weak topics; students download reviewers as they're published.</p>
          </div>
        </div>
      </div>
    </section>
  );
}