import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, FileText, Zap, ChevronRight } from 'lucide-react';
import { examApi } from '../../api/examApi';
import useAuthStore from '../../auth/useAuthStore';

const EXAM_TYPES = [
  {
    id:       'gened',
    label:    'General Education',
    short:    'GenEd',
    weight:   '20%',
    items:    150,
    hours:    2,
    minutes:  120,
    color:    'green',
    desc:     'Covers Communication Arts, Mathematics, Science, Social Sciences, Filipino, and Humanities.',
    topics:   ['Communication Arts', 'Mathematics', 'Science & Technology', 'Social Sciences', 'Filipino', 'Humanities & the Arts'],
    icon:     BookOpen,
  },
  {
    id:       'profed',
    label:    'Professional Education',
    short:    'ProfEd',
    weight:   '40%',
    items:    150,
    hours:    3,
    minutes:  180,
    color:    'blue',
    desc:     'Covers Child Development, Curriculum, Assessment, Teaching Principles, and the Teacher & Society.',
    topics:   ['Child & Adolescent Dev.', 'Curriculum Development', 'Assessment in Learning', 'Principles of Teaching', 'The Teacher & The School Curriculum'],
    icon:     FileText,
  },
  {
    id:       'major',
    label:    'Specialization (Major)',
    short:    'Major',
    weight:   '40%',
    items:    150,
    hours:    3,
    minutes:  180,
    color:    'purple',
    desc:     'Covers your major field: Math, English, Science, Filipino, MAPEH, Values Ed, and more.',
    topics:   ['Mathematics', 'English', 'Science', 'Filipino', 'MAPEH', 'Values Education', 'TLE'],
    icon:     Zap,
  },
];

export default function ExamSelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore(); // ← bago
  const [activeExams, setActiveExams] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadActiveExams() {
      try {
        const data = await examApi.getPublicExams();
        setActiveExams(data);
      } catch (err) {
        console.error('Failed to load active exams:', err);
      } finally {
        setFetching(false);
      }
    }
    loadActiveExams();
  }, []);

  const CATEGORY_MAP = { gened: 'GenEd', profed: 'ProfEd', major: 'Major' };

  // Major exams dapat tumugma sa department ng student; GenEd/ProfEd shared sa lahat.
  const findMatchingExam = (category) => {
    return activeExams.find((e) => {
      if (e.category !== category) return false;
      if (category === 'Major') return e.department === user?.department;
      return true;
    });
  };

  const handleStart = (exam) => {
    const category = CATEGORY_MAP[exam.id];
    const matchingExam = findMatchingExam(category);

    if (!matchingExam) {
      alert(`No active ${exam.label} exam has been published yet. Please check with your instructor.`);
      return;
    }

    navigate('/dashboard/exam', {
      state: {
        examId:      matchingExam.id,
        examType:    exam.id,
        label:       matchingExam.title,
        short:       exam.short,
        totalItems:  matchingExam.questions.length,
        durationMin: matchingExam.duration_minutes,
        color:       exam.color,
      },
    });
  };

  return (
    <>
      {/* Topbar */}
      <div className="user-topbar">
        <div className="user-topbar-left">
          <h1>Take Exam</h1>
          <p>Select your exam category — full LET simulation with countdown timer</p>
        </div>
        <div className="user-topbar-right">
          <span className="user-topbar-badge">
            <Zap size={12} /> LET Simulation Mode
          </span>
        </div>
      </div>

      <div className="user-content">

        {/* ── Info Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          borderRadius: 'var(--user-radius-lg)',
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>LET Simulation Mode — Real Exam Conditions</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12.5 }}>
              Timer auto-starts when you begin. Alerts at 30, 10, and 5 minutes. Exam auto-submits when time runs out.
            </div>
          </div>
        </div>

        {/* ── Exam Cards ── */}
        <div className="exam-cards-grid">
          {EXAM_TYPES.map((exam) => {
            const Icon = exam.icon;
            const category = CATEGORY_MAP[exam.id];
            const matchingExam = findMatchingExam(category); // ← palitan mula sa dating inline .find()
            return (
              <div className="exam-sel-card" key={exam.id}>
                <div className="exam-sel-card-top">
                  <div className={`exam-sel-icon ${exam.color}`}>
                    <Icon size={24} />
                  </div>
                  <span className={`exam-sel-weight ${exam.color}`}>
                    LET {exam.weight}
                  </span>
                </div>

                <h3 className="exam-sel-title">{exam.label}</h3>
                <p className="exam-sel-sub">{exam.desc}</p>

                <div className="exam-sel-meta">
                  <div className="exam-sel-meta-row">
                    <Clock size={14} />
                    <span>Duration: <strong>{matchingExam ? `${matchingExam.duration_minutes} min` : `${exam.hours} Hours`}</strong></span>
                  </div>
                  <div className="exam-sel-meta-row">
                    <FileText size={14} />
                    <span>Items: <strong>{matchingExam ? matchingExam.questions.length : 0} questions</strong></span>
                  </div>
                  <div className="exam-sel-meta-row">
                    <Zap size={14} />
                    <span>LET Weight: <strong>{exam.weight}</strong></span>
                  </div>
                </div>

                {/* Topics */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--user-text-muted)', marginBottom: 8 }}>
                    Coverage Areas
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {exam.topics.map((t) => (
                      <span key={t} className="u-badge u-badge-neutral" style={{ fontSize: 11 }}>{t}</span>
                    ))}
                  </div>
                </div>

                <button
                  className={`exam-sel-btn ${exam.color}`}
                  onClick={() => handleStart(exam)}
                  disabled={!matchingExam}
                  style={!matchingExam ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                >
                  {matchingExam ? `Start ${exam.short} Exam` : 'Not Available Yet'} <ChevronRight size={15} style={{ display: 'inline' }} />
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Note ── */}
        <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 12.5, color: 'var(--user-text-muted)' }}>
          ⚠️ Once started, the timer cannot be paused. Make sure you're ready before beginning.
        </div>

      </div>
    </>
  );
}