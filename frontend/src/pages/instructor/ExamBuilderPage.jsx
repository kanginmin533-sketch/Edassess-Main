//src/pages/instructor/ExamBuilderPage.jsx
import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, X, Clock, BookOpen, CheckSquare, Square } from 'lucide-react';
import { examApi } from '../../api/examApi';
import useAuthStore from '../../auth/useAuthStore';

// LET-based default durations
const CATEGORY_DEFAULTS = {
  GenEd:  120,
  ProfEd: 180,
  Major:  180,
};

const STATUS_BADGE = {
  active:    'inst-badge inst-badge-success',
  draft:     'inst-badge inst-badge-neutral',
  completed: 'inst-badge inst-badge-blue',
};

const CATEGORY_BADGE = {
  GenEd:  'inst-badge inst-badge-blue',
  ProfEd: 'inst-badge inst-badge-purple',
  Major:  'inst-badge inst-badge-amber',
};

const MAX_QUESTIONS_PER_EXAM = 180;

const DIFFICULTY_BADGE = {
  Easy:   'inst-badge inst-badge-success',
  Medium: 'inst-badge inst-badge-amber',
  Hard:   'inst-badge inst-badge-danger',
};

const EMPTY_FORM = { name: '', category: 'GenEd', duration: 120, selectedQuestions: [], status: 'draft' };

export default function ExamBuilderPage() {
  const { user } = useAuthStore(); // ← bago, para malaman ang sariling department
  const [exams, setExams]         = useState([]);
  const [questionPool, setQuestionPool] = useState([]);
  const [fetching, setFetching]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [qFilter, setQFilter]     = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        const [examsData, questionsData] = await Promise.all([
          examApi.getExams(),
          examApi.getQuestions(),
        ]);
        setExams(examsData.map(mapExamFromApi));
        setQuestionPool(questionsData.map(mapQuestionFromApi));
      } catch (err) {
        console.error('Failed to load exam builder data:', err);
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, []);

  function mapExamFromApi(e) {
    return {
      id: e.id,
      name: e.title,
      category: e.category,
      duration: e.duration_minutes,
      questions: e.questions.map((q) => q.id),
      status: e.status,
      created: new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  }
  function mapQuestionFromApi(q) {
    return {
      id: q.id,
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      department: q.department, // ← bago — null/'CIT'/'CTE', aplikable lang sa Major
    };
  }

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (exam) => {
    setEditItem(exam.id);
    setForm({ name: exam.name, category: exam.category, duration: exam.duration, selectedQuestions: [...exam.questions], status: exam.status });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditItem(null); };

  const handleCategoryChange = (cat) => {
    setForm((p) => ({ ...p, category: cat, duration: CATEGORY_DEFAULTS[cat] }));
  };

  const toggleQuestion = (id) => {
    setForm((p) => {
      const isSelected = p.selectedQuestions.includes(id);
      if (!isSelected && p.selectedQuestions.length >= MAX_QUESTIONS_PER_EXAM) {
        alert(`You can only select up to ${MAX_QUESTIONS_PER_EXAM} questions per exam.`);
        return p; // walang binago — huwag idagdag
      }
      return {
        ...p,
        selectedQuestions: isSelected
          ? p.selectedQuestions.filter((q) => q !== id)
          : [...p.selectedQuestions, id],
      };
    });
  };

  // GenEd/ProfEd — shared, makikita ng lahat ng instructor. Major — naka-scope
  // lang sa sariling department ng instructor (CIT instructor makakakita lang
  // ng Major questions na ginawa ng ibang CIT instructor, hindi CTE, at vice versa).
  const filteredPool = questionPool.filter((q) => {
    if (qFilter !== 'All' && q.category !== qFilter) return false;
    if (q.category === 'Major') return q.department === user?.department;
    return true;
  });

  // Select All is scoped to whatever's currently visible under qFilter — picking
  // "Major" then Select All only grabs the Major questions shown, not the whole pool.
  const allFilteredSelected = filteredPool.length > 0
    && filteredPool.every((q) => form.selectedQuestions.includes(q.id));

  const handleToggleSelectAll = () => {
    setForm((p) => {
      if (allFilteredSelected) {
        // Deselect: remove only the currently-filtered ids, keep selections
        // made under other filters untouched.
        const filteredIds = new Set(filteredPool.map((q) => q.id));
        return { ...p, selectedQuestions: p.selectedQuestions.filter((id) => !filteredIds.has(id)) };
      }

      const alreadySelected = new Set(p.selectedQuestions);
      const toAdd = filteredPool.filter((q) => !alreadySelected.has(q.id)).map((q) => q.id);
      const combined = [...p.selectedQuestions, ...toAdd];

      if (combined.length > MAX_QUESTIONS_PER_EXAM) {
        const room = MAX_QUESTIONS_PER_EXAM - p.selectedQuestions.length;
        alert(
          room > 0
            ? `Only ${room} more question(s) can be added — the maximum is ${MAX_QUESTIONS_PER_EXAM}. Selected the first ${room} from this list.`
            : `You've already reached the maximum of ${MAX_QUESTIONS_PER_EXAM} questions.`
        );
        return { ...p, selectedQuestions: [...p.selectedQuestions, ...toAdd.slice(0, Math.max(room, 0))] };
      }

      return { ...p, selectedQuestions: combined };
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Exam name is required.');
    if (form.selectedQuestions.length === 0) return alert('Select at least one question.');
    if (form.selectedQuestions.length > MAX_QUESTIONS_PER_EXAM) {
      return alert(`This exam has ${form.selectedQuestions.length} questions — the maximum is ${MAX_QUESTIONS_PER_EXAM}.`);
    }

    setSaving(true);
    try {
      const payload = {
        title: form.name,
        category: form.category,
        duration_minutes: form.duration,
        status: form.status,
        question_ids: form.selectedQuestions,
      };

      if (editItem) {
        const updated = await examApi.updateExam(editItem, payload);
        setExams((prev) => prev.map((e) => e.id === editItem ? mapExamFromApi(updated) : e));
      } else {
        const created = await examApi.createExam(payload);
        setExams((prev) => [mapExamFromApi(created), ...prev]);
      }
      closeModal();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to save exam.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this exam?')) return;
    try {
      await examApi.deleteExam(id);
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to delete exam.');
    }
  };

  if (fetching) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading exam builder...</div>;
  }

  return (
    <>
      {/* Topbar */}
      <div className="inst-topbar">
        <div className="inst-topbar-left">
          <h1>Exam Builder</h1>
          <p>Create quizzes with LET-based time limits and question pools</p>
        </div>
        <div className="inst-topbar-right">
          <button className="inst-btn inst-btn-primary inst-btn-sm" onClick={openAdd}>
            <Plus size={13} /> Create Exam
          </button>
        </div>
      </div>

      <div className="inst-content">
        <div className="inst-card">
          <div className="inst-card-header">
            <div>
              <h3>All Exams</h3>
              <p>Manage your created assessments</p>
            </div>
          </div>

          {exams.length === 0 ? (
            <div className="inst-empty">
              <ClipboardList size={40} />
              <p>No exams yet. Create your first exam!</p>
            </div>
          ) : (
            <table className="inst-table">
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{exam.name}</td>
                    <td><span className={CATEGORY_BADGE[exam.category]}>{exam.category}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--inst-text-sub)' }}>
                        <Clock size={13} /> {exam.duration} min
                      </div>
                    </td>
                    <td>{exam.questions.length} items</td>
                    <td><span className={STATUS_BADGE[exam.status]}>{exam.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--inst-text-muted)' }}>{exam.created}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="inst-btn-icon" onClick={() => openEdit(exam)} title="Edit">
                          <BookOpen size={13} />
                        </button>
                        <button className="inst-btn-icon" onClick={() => handleDelete(exam.id)} title="Delete" style={{ color: 'var(--inst-danger)' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="inst-save-bar">
            <p>{exams.length} exam(s) total</p>
          </div>
        </div>
      </div>

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="inst-modal-backdrop" onClick={closeModal}>
          <div className="inst-modal" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className="inst-modal-header">
              <h3>{editItem ? 'Edit Exam' : 'Create New Exam'}</h3>
              <button className="inst-btn-icon" onClick={closeModal}><X size={16} /></button>
            </div>

            <div className="inst-modal-body">

              {/* Name */}
              <div className="inst-form-group">
                <label className="inst-form-label">Exam Name</label>
                <input
                  className="inst-form-input"
                  placeholder="e.g. GenEd Midterm Review"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              {/* Category + Duration + Status */}
              <div className="inst-three-col">
                <div className="inst-form-group">
                  <label className="inst-form-label">Category</label>
                  <select
                    className="inst-form-select"
                    value={form.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="GenEd">GenEd</option>
                    <option value="ProfEd">ProfEd</option>
                    <option value="Major">Major</option>
                  </select>
                  {form.category === 'Major' && (
                    <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--inst-text-muted)' }}>
                      Scoped to your department: <strong>{user?.department || '—'}</strong>
                    </p>
                  )}
                </div>

                <div className="inst-form-group">
                  <label className="inst-form-label">
                    Duration
                    <span className="inst-form-label-sub">· LET-based</span>
                  </label>
                  <div className="inst-form-input-unit">
                    <input
                      type="number"
                      min={30}
                      max={300}
                      value={form.duration}
                      onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                    />
                    <span className="inst-form-unit-label">min</span>
                  </div>
                </div>

                <div className="inst-form-group">
                  <label className="inst-form-label">Status</label>
                  <select
                    className="inst-form-select"
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              {/* Question Picker */}
              <div className="inst-form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <label className="inst-form-label" style={{ marginBottom: 0 }}>
                    Select Questions
                    <span className="inst-form-label-sub">
                      · {form.selectedQuestions.length} / {MAX_QUESTIONS_PER_EXAM} selected
                    </span>
                  </label>

                  <button
                    type="button"
                    className="inst-btn inst-btn-sm inst-btn-secondary"
                    onClick={handleToggleSelectAll}
                    disabled={filteredPool.length === 0}
                  >
                    {allFilteredSelected ? <Square size={13} /> : <CheckSquare size={13} />}
                    {allFilteredSelected ? `Deselect ${qFilter}` : `Select All ${qFilter} (${filteredPool.length})`}
                  </button>
                </div>

                {/* Filter */}
                <div style={{ display: 'flex', gap: 6, margin: '12px 0' }}>
                  {['All', 'GenEd', 'ProfEd', 'Major'].map((f) => (
                    <button
                      key={f}
                      className={`inst-btn inst-btn-sm ${qFilter === f ? 'inst-btn-primary' : 'inst-btn-secondary'}`}
                      onClick={() => setQFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Question list */}
                <div style={{ border: '1px solid var(--inst-border)', borderRadius: 'var(--inst-radius)', overflow: 'hidden' }}>
                  {filteredPool.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--inst-text-sub)' }}>
                      {qFilter === 'Major'
                        ? `No Major questions for your department (${user?.department || '—'}) yet. Add some in the Question Bank first.`
                        : 'No questions available. Add some in the Question Bank first.'}
                    </div>
                  ) : (
                    filteredPool.map((q) => {
                      const isSelected = form.selectedQuestions.includes(q.id);
                      const limitReached = !isSelected && form.selectedQuestions.length >= MAX_QUESTIONS_PER_EXAM;
                      return (
                        <div
                          key={q.id}
                          onClick={() => !limitReached && toggleQuestion(q.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '11px 14px',
                            cursor: limitReached ? 'not-allowed' : 'pointer',
                            borderBottom: '1px solid var(--inst-border)',
                            background: isSelected ? 'var(--inst-accent-soft)' : 'transparent',
                            opacity: limitReached ? 0.45 : 1,
                            transition: 'background 0.15s, opacity 0.15s',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={limitReached}
                            onChange={() => toggleQuestion(q.id)}
                            style={{ flexShrink: 0, accentColor: 'var(--inst-accent)' }}
                          />
                          <span style={{ flex: 1, fontSize: 13, color: 'var(--inst-text)' }}>{q.question}</span>
                          <span className={DIFFICULTY_BADGE[q.difficulty]}>{q.difficulty}</span>
                          <span className={CATEGORY_BADGE[q.category]}>
                            {q.category === 'Major' && q.department ? `Major (${q.department})` : q.category}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            <div className="inst-modal-footer">
              <button className="inst-btn inst-btn-secondary inst-btn-sm" onClick={closeModal}>Cancel</button>
              <button className="inst-btn inst-btn-primary inst-btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editItem ? 'Update Exam' : 'Create Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}