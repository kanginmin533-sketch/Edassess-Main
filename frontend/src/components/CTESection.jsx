import '../styles/CTESection.css';

const values = [
  {
    title: 'Academic Excellence',
    desc: 'Maintaining the highest standards of scholarly and professional achievement.',
  },
  {
    title: 'Integrity & Accountability',
    desc: 'Upholding ethical practice in all academic and institutional endeavors.',
  },
  {
    title: 'Inclusive Learning',
    desc: 'Ensuring equitable access and opportunity for all teacher education students.',
  },
  {
    title: 'Innovation in Pedagogy',
    desc: 'Embracing modern tools and approaches to enhance teaching and learning.',
  },
];

export default function CTESection() {
  return (
    <section className="cte-section" id="cte">
      <div className="container">
        <div className="section-label">Our Department</div>
        <h2 className="section-title">The College of Teacher Education</h2>
        <div className="section-rule" />
        <p className="body-text">
          The CTE at PRMSU IBA serves as the backbone of teacher formation in
          Zambales — committed to developing educators of character, competence,
          and compassion.
        </p>

        <div className="cte-banner">
          <div className="cte-banner-left">
            <h3>Forming Teachers Who<br />Transform Communities</h3>
            <p>
              The CTE operates with a deep commitment to academic rigor, inclusive education,
              and professional readiness. EduAssess is an extension of this commitment —
              providing a technology-driven pathway to licensure success and lifelong learning.
            </p>
          </div>

          <div className="cte-values">
            {values.map(({ title, desc }) => (
              <div className="cte-val" key={title}>
                <div className="cte-val-bullet" />
                <div className="cte-val-text">
                  <h5>{title}</h5>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}