import '../styles/CTASection.css';

export default function CTASection() {
  return (
    <section className="cta-section" id="register">
      <div className="container">
        <div className="cta-inner">
          <div className="section-label">Get Started</div>
          <h2 className="cta-title">
            Ready to Begin<br />Your Review Journey?
          </h2>
          <p className="cta-sub">
            Register for EduAssess and gain structured access to comprehensive
            review modules curated for CTE students at PRMSU IBA.
          </p>
          <div className="cta-buttons">
            <a href="login" className="cta-btn-primary">Register as Student →</a>
            <a href="#" className="cta-btn-ghost">Faculty Access</a>
          </div>
        </div>
      </div>
    </section>
  );
}
