// 📁 frontend/src/pages/user/ResultsPage.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, RotateCcw, Home, Clock, TrendingDown, BookOpen, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { examApi } from '../../api/examApi';

const scoreColor = (pct) =>
  pct >= 80 ? 'var(--user-accent)' : pct >= 75 ? 'var(--user-amber)' : 'var(--user-danger)';

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
};

function mapAttemptToState(a) {
  return {
    examType: a.exam_type,
    label: a.label,
    short: a.category,
    color: 'green',
    score: a.score,
    total: a.total,
    percentage: a.percentage,
    timeTaken: a.time_taken_seconds,
    autoSubmit: a.auto_submit,
    questions: a.detail?.questions || [],
    answers: a.detail?.answers || {},
    subjectBreakdown: a.subject_breakdown || {},
  };
}

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate   = useNavigate();
  const { attemptId } = useParams();

  const [fetchedState, setFetchedState] = useState(null);
  const [fetching, setFetching] = useState(!state && !!attemptId);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (state || !attemptId) return; // already have data via navigation state
    async function loadAttempt() {
      try {
        const attempt = await examApi.getAttemptById(attemptId);
        setFetchedState(mapAttemptToState(attempt));
      } catch (err) {
        console.error('Failed to load exam result:', err);
        setNotFound(true);
      } finally {
        setFetching(false);
      }
    }
    loadAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const data = state || fetchedState;

  if (fetching) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading result...</div>;
  }

  if (!data || notFound) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <p style={{ color: 'var(--user-text-sub)' }}>No exam result found.</p>
        <button className="exam-btn exam-btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  const { examType, label, short, color, score, total, percentage, timeTaken, autoSubmit, questions = [], answers = {}, subjectBreakdown = {} } = data;
  const passingScore = Math.round(total * 0.75);
  const passed    = score >= passingScore;
  const correct   = score;
  const incorrect = total - score;

  const subjectEntries = Object.entries(subjectBreakdown);

    // Note: the attempt is already saved to the backend by ExamPage
    // (examApi.createAttempt) before navigating here — nothing to save
    // in this page anymore.

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(16);
    doc.text('EDAssess — Exam Result Summary', 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Exam: ${label}`, 14, y); y += 7;
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 14, y); y += 7;
    doc.text(`Score: ${score}/${total} (${percentage}%)`, 14, y); y += 7;
    doc.text(`Result: ${passed ? 'PASSED' : 'NOT YET'} (Passing: ${passingScore}/${total})`, 14, y); y += 7;
    doc.text(`Time used: ${formatTime(timeTaken || 0)}`, 14, y); y += 7;
    if (autoSubmit) { doc.text('Note: Auto-submitted — time expired', 14, y); y += 7; }

    y += 6;
    doc.setFontSize(13);
    doc.text('Score by Subject', 14, y);
    y += 8;
    doc.setFontSize(11);

    if (subjectEntries.length === 0) {
      doc.text('No subject breakdown available for this attempt.', 14, y);
      y += 7;
    } else {
      subjectEntries.forEach(([subject, s]) => {
        const pct = Math.round((s.correct / s.total) * 100);
        doc.text(`${subject}: ${s.correct}/${s.total} (${pct}%)`, 14, y);
        y += 7;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    }

    doc.save(`${(short || 'exam').replace(/\s+/g, '_')}-result-summary.pdf`);
  };

  const wrongQuestions = questions.filter((_, i) => answers[i] !== questions[i]?.answer);

  return (
    <>
      <div className="user-topbar">
        <div className="user-topbar-left">
          <h1>Exam Results</h1>
          <p>{label} — LET Simulation Result</p>
        </div>
        <div className="user-topbar-right">
          <button className="exam-btn exam-btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={handleExportPDF}>
            <Download size={13} /> Export as PDF
          </button>
          <button className="exam-btn exam-btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => navigate('/dashboard/selection')}>
            <RotateCcw size={13} /> Retake
          </button>
          <button className="exam-btn exam-btn-primary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => navigate('/dashboard')}>
            <Home size={13} /> Dashboard
          </button>
        </div>
      </div>

      <div className="user-content">
        <div className="user-two-col" style={{ alignItems: 'start' }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Score Hero */}
            <div className="user-card">
              <div className="result-hero">
                {autoSubmit && (
                  <div style={{ marginBottom: 14, padding: '8px 16px', background: 'var(--user-danger-soft)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, fontSize: 12.5, color: 'var(--user-danger)', fontWeight: 600 }}>
                    ⏰ Auto-submitted — time expired
                  </div>
                )}
                <div className={`result-score-circle ${passed ? 'pass' : 'fail'}`}>
                  <span className="result-score-num">{score}/{total}</span>
                  <span className="result-score-pct">Score</span>
                </div>
                <h2 className="result-verdict">{passed ? '🎉 Passed!' : '😔 Not Yet'}</h2>
                <p className="result-verdict-sub">
                  {passed
                    ? `Great job! You passed the ${short} simulation.`
                    : `Keep practicing! Passing score is ${passingScore}/${total}. You scored ${score}/${total}.`}
                </p>
              </div>

              <div className="user-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Correct',   value: correct,            icon: CheckCircle, color: 'var(--user-accent)' },
                    { label: 'Incorrect', value: incorrect,          icon: XCircle,     color: 'var(--user-danger)' },
                    { label: 'Time Used', value: formatTime(timeTaken || 0), icon: Clock, color: 'var(--user-blue)' },
                  ].map(({ label: lbl, value, icon: Icon, color: col }) => (
                    <div key={lbl} style={{ textAlign: 'center', padding: '14px 10px', background: 'var(--user-bg)', borderRadius: 'var(--user-radius)', border: '1px solid var(--user-border)' }}>
                      <Icon size={18} style={{ color: col, marginBottom: 6 }} />
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--user-text)', lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: 11, color: 'var(--user-text-muted)', marginTop: 4 }}>{lbl}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    <span style={{ color: 'var(--user-text-sub)' }}>Your Score</span>
                    <span style={{ color: scoreColor(percentage) }}>{score}/{total}</span>
                  </div>
                  <div style={{ height: 10, background: 'var(--user-border)', borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: scoreColor(percentage), borderRadius: 5, transition: 'width 0.6s' }} />
                    <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: 2, background: 'rgba(0,0,0,0.3)' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--user-text-muted)', marginTop: 4, textAlign: 'right' }}>Passing: {passingScore}/{total}</div>
                </div>

                {/* PRC area-minimum reminder — this is a single-area score, not the
                    final LET verdict. The real combined rule lives on the Dashboard. */}
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4,
                  padding: '10px 14px', borderRadius: 'var(--user-radius)',
                  background: percentage < 50 ? 'var(--user-danger-soft)' : 'var(--user-bg)',
                  border: `1px solid ${percentage < 50 ? 'rgba(220,38,38,0.2)' : 'var(--user-border)'}`,
                }}>
                  {percentage < 50
                    ? <XCircle size={15} style={{ color: 'var(--user-danger)', flexShrink: 0, marginTop: 1 }} />
                    : <CheckCircle size={15} style={{ color: 'var(--user-text-muted)', flexShrink: 0, marginTop: 1 }} />}
                  <p style={{ margin: 0, fontSize: 11.5, color: 'var(--user-text-sub)', lineHeight: 1.6 }}>
                    {percentage < 50
                      ? <>Under PRC rules, a score below 50% in any single area fails the LET regardless of your average in the other areas. This {short} attempt is below that minimum.</>
                      : <>This {short} score is above the 50% area minimum required by PRC. Official LET standing needs a 75% average combined with GenEd, ProfEd, and Major — check your <strong>Overall LET Standing</strong> on the Dashboard.</>}
                  </p>
                </div>
              </div>
            </div>

            {/* Score by Subject */}
            {subjectEntries.length > 0 && (
              <div className="user-card">
                <div className="user-card-header">
                  <div>
                    <h3>Score by Subject</h3>
                    <p>Breakdown per subject area — e.g. "Mathematics: 8/15"</p>
                  </div>
                </div>
                <div className="user-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {subjectEntries.map(([subject, s]) => {
                    const pct = Math.round((s.correct / s.total) * 100);
                    return (
                      <div key={subject}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
                          <span style={{ color: 'var(--user-text)' }}>{subject}</span>
                          <span style={{ color: scoreColor(pct) }}>{s.correct}/{s.total} ({pct}%)</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--user-border)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: scoreColor(pct), borderRadius: 4, transition: 'width 0.6s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button className="exam-btn exam-btn-primary" style={{ justifyContent: 'center', padding: 12 }} onClick={() => navigate('/dashboard/selection')}>
                <RotateCcw size={15} /> Retake Exam
              </button>
              <button className="exam-btn exam-btn-secondary" style={{ justifyContent: 'center', padding: 12 }} onClick={() => navigate('/dashboard/review')}>
                <BookOpen size={15} /> Review Modules
              </button>
            </div>

            {/* Performance Tip */}
            <div className="user-card" style={{ background: passed ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : 'linear-gradient(135deg, #fff7ed, #fed7aa)' }}>
              <div className="user-card-body">
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--user-text)', margin: '0 0 10px' }}>
                  {passed ? '🌟 Keep It Up!' : '💡 Study Tip'}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--user-text-sub)', margin: 0, lineHeight: 1.6 }}>
                  {passed
                    ? `You passed with ${percentage}%! Review the items you missed and aim for 85%+ on the real LET.`
                    : `Focus on the items you missed. Use the Review Modules to strengthen weak areas, then retake the exam.`}
                </p>
              </div>
            </div>
          </div>

                    {/* Right — Answer Key + Explanations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="user-card">
              <div className="user-card-header">
                <div>
                  <h3>Answer Key & Explanations</h3>
                  <p>All {questions.length} questions — every choice explained</p>
                </div>
                <TrendingDown size={16} style={{ color: 'var(--user-danger)' }} />
              </div>

              <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                {questions.map((q, i) => {
                  const userAnswer    = answers[i];
                  const isCorrect     = userAnswer === q.answer;
                  const isUnanswered  = userAnswer === undefined;
                  const choiceExps    = q.choice_explanations || [];

                  return (
                    <div key={q.id} style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--user-border)',
                      background: isCorrect ? 'rgba(22,163,74,0.03)' : isUnanswered ? 'transparent' : 'rgba(220,38,38,0.03)',
                    }}>
                      {/* Question header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: isCorrect ? 'var(--user-accent-soft)' : 'var(--user-danger-soft)',
                          color: isCorrect ? 'var(--user-accent)' : 'var(--user-danger)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800,
                        }}>
                          {isCorrect ? '✓' : '✗'}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--user-text)', margin: 0, fontWeight: 600, lineHeight: 1.5, flex: 1 }}>
                          {i + 1}. {q.question}
                          {q.subject && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: 'var(--user-text-muted)' }}>· {q.subject}</span>}
                        </p>
                      </div>

                      {isUnanswered && (
                        <div style={{ marginLeft: 32, marginBottom: 10, fontSize: 12, color: 'var(--user-amber)', background: 'var(--user-amber-soft)', padding: '4px 10px', borderRadius: 6, display: 'inline-flex', gap: 6 }}>
                          ⚠️ Not answered
                        </div>
                      )}

                      {/* Every choice, each with its own explanation */}
                      <div style={{ marginLeft: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.choices.map((choiceText, ci) => {
                          const isTheCorrect = ci === q.answer;
                          const isThePicked  = ci === userAnswer;
                          const exp = (choiceExps[ci] || '').trim();

                          const borderColor = isTheCorrect
                            ? 'var(--user-accent)'
                            : isThePicked
                            ? 'var(--user-danger)'
                            : 'var(--user-border)';

                          return (
                            <div
                              key={ci}
                              style={{
                                padding: '10px 14px',
                                background: 'var(--user-bg)',
                                borderRadius: 8,
                                border: '1px solid var(--user-border)',
                                borderLeft: `3px solid ${borderColor}`,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: exp ? 5 : 0, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--user-text)' }}>
                                  {String.fromCharCode(65 + ci)}. {choiceText}
                                </span>
                                {isTheCorrect && (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--user-accent)', background: 'var(--user-accent-soft)', padding: '2px 8px', borderRadius: 10 }}>
                                    ✓ Correct answer
                                  </span>
                                )}
                                {isThePicked && !isTheCorrect && (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--user-danger)', background: 'var(--user-danger-soft)', padding: '2px 8px', borderRadius: 10 }}>
                                    Your answer
                                  </span>
                                )}
                              </div>
                              {exp ? (
                                <p style={{ fontSize: 12.5, color: 'var(--user-text-sub)', margin: 0, lineHeight: 1.6 }}>{exp}</p>
                              ) : isTheCorrect && q.explanation ? (
                                // Fallback to the old single overall explanation
                                // for older attempts saved before per-choice
                                // explanations existed.
                                <p style={{ fontSize: 12.5, color: 'var(--user-text-sub)', margin: 0, lineHeight: 1.6 }}>{q.explanation}</p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}