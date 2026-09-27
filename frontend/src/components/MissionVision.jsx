// 📁 frontend/src/components/MissionVision.jsx
import '../styles/MissionVision.css';

export default function MissionVision() {
  return (
    <section className="mv-section" id="mission">
      <div className="container">
        <div className="section-label">Mission & vision</div>
        <h2 className="section-title">
          Guided by purpose,<br />driven by excellence
        </h2>
        <div className="section-rule" />
        <p className="body-text">
          The College of Teacher Education and College of Industrial Technology at PRMSU IBA is committed to producing
          globally competent, values-driven educators who are responsive to the
          demands of 21st-century learning.
        </p>

        <div className="mv-grid">
          <div className="mv-card">
            <div className="mv-card-icon">M</div>
            <h3>Mission</h3>
            <p>
              The PRMSU shall primarily provide
              advance and higher professional,
              technical, and special instructions in
              various disciplines; undertake research,
              extension and income generation programs for
              the sustainable development of Zambales,
              the region and the country.
            </p>
            <div className="mv-quote">
              "Educating the educators who shape tomorrow's world."
            </div>
          </div>

          <div className="mv-card">
            <div className="mv-card-icon">V</div>
            <h3>Vision</h3>
            <p>
              PRMSU shall be a premier learner-
              centered and proactive university
              in a digital and global society.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}