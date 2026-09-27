// 📁 frontend/src/components/PlatformSection.jsx
import { ShieldCheck, BookOpenCheck, BarChart3, Timer } from 'lucide-react';
import Icon3D from './Icon3D';
import '../styles/PlatformSection.css';

const CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets';

const features = [
  { title: 'Secure Role Management', desc: 'Tiered access for students, faculty, and administrators with system-enforced boundaries.', icon: `${CDN}/Locked/3D/locked_3d.png`, fallback: ShieldCheck, tone: 'blue' },
  { title: 'LET-Aligned Review Modules', desc: 'Content structured around the Licensure Examination for Teachers (LET) coverage areas.', icon: `${CDN}/Open%20book/3D/open_book_3d.png`, fallback: BookOpenCheck, tone: 'amber' },
  { title: 'Progress Tracking', desc: 'Students monitor review completion and performance; faculty oversee cohort readiness metrics.', icon: `${CDN}/Bar%20chart/3D/bar_chart_3d.png`, fallback: BarChart3, tone: 'violet' },
  { title: 'Timed Assessments', desc: 'Simulated exam conditions with controlled time limits to reinforce readiness under pressure.', icon: `${CDN}/Alarm%20clock/3D/alarm_clock_3d.png`, fallback: Timer, tone: 'teal' },
];

const overviewRows = [
  { label: 'Platform type', value: 'Web-based exam reviewer system' },
  { label: 'Access model',  value: 'Mandatory Access Control (MAC)' },
  { label: 'Primary users', value: 'CTE & CIT students, faculty' },
  { label: 'Institution',   value: 'PRMSU Iba' },
];

const bars = [
  { subject: 'General Education',      pct: 88 },
  { subject: 'Professional Education',  pct: 95 },
  { subject: 'Specialization',          pct: 80 },
];

export default function PlatformSection() {
  return (
    <section className="platform-section" id="platform">
      <div className="container">
        <div className="platform-row">
          <div>
            <div className="section-label">The platform</div>
            <h2 className="section-title">EduAssess — built for teacher education</h2>
            <div className="section-rule" />
            <p className="body-text">
              Designed with the needs of pre-service teachers in mind, EduAssess
              delivers a disciplined, distraction-free review environment governed
              by a mandatory access control model.
            </p>

            <div className="platform-features">
              {features.map(({ title, desc, icon, fallback, tone }) => (
                <div className="feature-item" key={title}>
                  <Icon3D src={icon} fallback={fallback} tone={tone} size={32} />
                  <div className="feature-body">
                    <h4>{title}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="platform-visual">
            <div className="pv-label">System overview</div>
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
                  <span>Review coverage</span>
                  <span>{subject}</span>
                </div>
                <div className="pv-bar-track">
                  <div className="pv-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}

            <div className="pv-divider" />
            <div className="pv-row">
              <span>Access control</span>
              <span className="pv-status">● Enforced</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}