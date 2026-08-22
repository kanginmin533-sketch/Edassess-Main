import '../styles/MacSection.css';

const macCards = [
  {
    num: '01',
    title: 'Policy-Driven Access',
    desc: 'All permissions are defined at the system level by administrators, ensuring consistent and impartial control over who can access review materials.',
    featured: false,
  },
  {
    num: '02',
    title: 'Role Classification',
    desc: 'Users are assigned security roles — Student, Faculty, or Administrator — and access is determined automatically based on that classification.',
    featured: true,
  },
  {
    num: '03',
    title: 'Content Labeling',
    desc: 'Review modules and assessments carry classification labels that determine visibility. Sensitive items are shielded from unauthorized views.',
    featured: false,
  },
  {
    num: '04',
    title: 'Audit & Accountability',
    desc: 'All access events are logged. The system maintains a transparent activity trail, supporting institutional integrity and academic compliance.',
    featured: false,
  },
  {
    num: '05',
    title: 'Non-Discretionary Control',
    desc: 'Unlike voluntary systems, Mock policies cannot be overridden by individual users — eliminating unauthorized sharing or privilege escalation.',
    featured: false,
  },
  {
    num: '06',
    title: 'Academic Application',
    desc: 'In EduAssess, Mock governs reviewer access, exam visibility, and faculty controls — directly supporting a fair and secure academic environment.',
    featured: false,
  },
];

export default function MacSection() {
  return (
    <section className="mac-section" id="mac">
      <div className="container">
        <div className="section-label">The Mock Framework</div>
        <h2 className="section-title">What is Mock Examination Reviewer System</h2>
        <div className="section-rule" />
        <p className="body-text">
          A mock exam reviewer is a study tool or 
          material used to help students prepare for an 
          upcoming test by practicing with questions 
          that are similar to the actual exam.
        </p>

        <div className="mac-grid">
          {macCards.map(({ num, title, desc, featured }) => (
            <div className={`mac-card${featured ? ' featured' : ''}`} key={num}>
              <div className="mac-card-num">{num}</div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}