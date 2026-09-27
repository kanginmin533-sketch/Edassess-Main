// 📁 frontend/src/components/MacSection.jsx
import { ClipboardList, UserCog, Tag, Search, Lock, GraduationCap } from 'lucide-react';
import Icon3D from './Icon3D';
import '../styles/MacSection.css';

const CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets';

const macCards = [
  { title: 'Policy-driven access', desc: 'All permissions are defined at the system level by administrators, ensuring consistent and impartial control over who can access review materials.', accent: 'blue', icon: `${CDN}/Clipboard/3D/clipboard_3d.png`, fallback: ClipboardList },
  { title: 'Role classification', desc: 'Users are assigned security roles — student, faculty, or administrator — and access is determined automatically based on that classification.', accent: 'violet', icon: `${CDN}/Bust%20in%20silhouette/3D/bust_in_silhouette_3d.png`, fallback: UserCog, featured: true },
  { title: 'Content labeling', desc: 'Review modules and assessments carry classification labels that determine visibility. Sensitive items are shielded from unauthorized views.', accent: 'amber', icon: `${CDN}/Bookmark/3D/bookmark_3d.png`, fallback: Tag },
  { title: 'Audit & accountability', desc: 'All access events are logged. The system maintains a transparent activity trail, supporting institutional integrity and academic compliance.', accent: 'teal', icon: `${CDN}/Magnifying%20glass%20tilted%20left/3D/magnifying_glass_tilted_left_3d.png`, fallback: Search },
  { title: 'Non-discretionary control', desc: 'Unlike voluntary systems, MAC policies cannot be overridden by individual users — eliminating unauthorized sharing or privilege escalation.', accent: 'coral', icon: `${CDN}/Locked/3D/locked_3d.png`, fallback: Lock },
  { title: 'Academic application', desc: 'In EduAssess, MAC governs reviewer access, exam visibility, and faculty controls — directly supporting a fair and secure academic environment.', accent: 'blue', icon: `${CDN}/Graduation%20cap/3D/graduation_cap_3d.png`, fallback: GraduationCap },
];

export default function MacSection() {
  return (
    <section className="mac-section" id="mac">
      <div className="container">
        <div className="section-label">The access model</div>
        <h2 className="section-title">What is Mandatory Access Control?</h2>
        <div className="section-rule" />
        <p className="body-text">
          Mandatory Access Control (MAC) is a security model where access to
          resources is governed by a fixed system policy, not by individual
          users — the same principle EduAssess uses to control who can view
          which review modules and exams.
        </p>

        <div className="mac-grid">
          {macCards.map(({ title, desc, accent, icon, fallback, featured }) => (
            <div className={`mac-card card-glossy accent-${accent}${featured ? ' featured' : ''}`} key={title}>
              <Icon3D src={icon} fallback={fallback} tone={accent} size={38} />
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}