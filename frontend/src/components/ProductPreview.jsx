import '../styles/ProductPreview.css';

export default function ProductPreview() {
  return (
    <section className="preview-section" id="preview">
      <div className="container">
        <div className="preview-header">
          <div className="section-label">The Reviewer, Live</div>
          <h2 className="section-title">See EduAssess in Action</h2>
          <div className="section-rule" />
          <p className="body-text">
            A full LET simulation — countdown timer, question navigator, and instant
            scoring — built to feel like the real exam day, not a quiz app.
          </p>
        </div>

        <div className="preview-frame">
          <div className="preview-chrome">
            <div className="preview-dots">
              <span /><span /><span />
            </div>
            <div className="preview-chrome-title">EduAssess — Professional Education</div>
            <div className="preview-timer">01:58:32</div>
          </div>

          <div className="preview-body">
            <div className="preview-nav">
              <div className="preview-nav-label">Questions</div>
              <div className="preview-nav-grid">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      i === 6 ? 'nav-dot current' : i < 6 ? 'nav-dot answered' : 'nav-dot'
                    }
                  />
                ))}
              </div>
              <div className="preview-nav-legend">
                <span><i className="dot answered" /> Answered</span>
                <span><i className="dot flagged" /> Flagged</span>
              </div>
            </div>

            <div className="preview-question">
              <div className="preview-progress">
                <div className="preview-progress-fill" />
              </div>
              <div className="preview-qnum">Question 7 of 150</div>
              <p className="preview-qtext">
                Which principle best describes Vygotsky's Zone of Proximal Development?
              </p>
              <div className="preview-choices">
                {[
                  'Tasks a learner completes entirely alone',
                  'The gap between independent and guided ability',
                  'Tasks too advanced regardless of support',
                  'A fixed measure of a learner\u2019s IQ',
                ].map((choice, i) => (
                  <div key={choice} className={`preview-choice ${i === 1 ? 'selected' : ''}`}>
                    <span className="choice-letter">{String.fromCharCode(65 + i)}</span>
                    {choice}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}