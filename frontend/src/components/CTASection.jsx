// 📁 frontend/src/components/CTASection.jsx
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import Icon3D from './Icon3D';
import '../styles/CTASection.css';

const CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets';

export default function CTASection() {
  return (
    <section className="cta-section" id="register">
      <div className="container">
        <div className="cta-inner">
          <Icon3D src={`${CDN}/Trophy/3D/trophy_3d.png`} fallback={Trophy} tone="amber" size={40} />
          <div className="section-label" style={{ marginTop: 22 }}>Get started</div>
          <h2 className="cta-title">
            Ready to begin<br />your review journey?
          </h2>
          <p className="cta-sub">
            Register for EduAssess and gain structured access to comprehensive
            review modules curated for CTE and CIT students at PRMSU IBA.
          </p>
          <div className="cta-buttons">
            <a href="login" className="btn-primary">Register as student</a>
            <a href="#" className="btn-ghost">Faculty access</a>
          </div>
        </div>
      </div>
    </section>
  );
}