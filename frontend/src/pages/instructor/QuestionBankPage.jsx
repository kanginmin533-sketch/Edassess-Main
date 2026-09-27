// 📁 frontend/src/pages/instructor/QuestionBankPage.jsx
import { useState, useRef } from 'react';
import { BookOpen, Plus, Search, Edit2, Trash2, X, Upload, FileText, CheckCircle, AlertCircle, Copy, ClipboardCheck, AlertTriangle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import useQuestionBank from '../../hooks/useQuestionBank';
import useAuthStore from '../../auth/useAuthStore';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const CATEGORIES = ['All', 'GenEd', 'ProfEd', 'Major'];

// Pulls text out of a PDF while preserving line breaks (detected via
// vertical position changes between text fragments). Flat extraction loses
// line structure, which the structured parser below depends on.
async function extractPdfLines(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const lines = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    let lastY = null;
    let current = '';
    for (const item of content.items) {
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        if (current.trim()) lines.push(current.trim());
        current = item.str;
      } else {
        current += (current ? ' ' : '') + item.str;
      }
      lastY = y;
    }
    if (current.trim()) lines.push(current.trim());
  }
  return lines;
}

function splitQuestionsAndKey(lines) {
  const splitIdx = lines.findIndex((l) => /answer\s*key/i.test(l));
  if (splitIdx === -1) return { questionLines: lines, keyLines: [] };
  return { questionLines: lines.slice(0, splitIdx), keyLines: lines.slice(splitIdx + 1) };
}

function parseQuestionLines(lines) {
  const qRe = /^(\d{1,3})\.\s*(.*)$/;
  const cRe = /^([A-D])\.\s*(.*)$/;
  const questions = [];
  let current = null;
  let field = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || /^part\s+[ivx]+/i.test(line)) continue;

    const qMatch = line.match(qRe);
    const cMatch = line.match(cRe);

    if (qMatch) {
      if (current) questions.push(current);
      current = { number: Number(qMatch[1]), stem: qMatch[2], choices: {} };
      field = 'stem';
      continue;
    }
    if (cMatch && current) {
      current.choices[cMatch[1]] = cMatch[2];
      field = cMatch[1];
      continue;
    }
    if (current && field) {
      if (field === 'stem') current.stem += ' ' + line;
      else current.choices[field] = (current.choices[field] || '') + ' ' + line;
    }
  }
  if (current) questions.push(current);
  return questions;
}

function parseAnswerKeyLines(lines) {
  const aRe = /^(\d{1,3})\.\s*([A-D])\.\s*(.*)$/;
  const ratRe = /^rationale:\s*(.*)$/i;
  const wrongHeaderRe = /^wrong answer explanation:?\s*(.*)$/i;
  const wrongItemRe = /^([A-D])\.\s*(.*)$/;
  const keys = {};
  let current = null;
  let state = null; // null | 'rationale' | 'wrong' | 'A' | 'B' | 'C' | 'D'

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const aMatch = line.match(aRe);
    if (aMatch) {
      if (current) keys[current.number] = current;
      current = {
        number: Number(aMatch[1]),
        letter: aMatch[2],
        answerText: aMatch[3],
        rationale: '',
        wrongExplanations: {},
      };
      state = null;
      continue;
    }
    if (!current) continue;

    const ratMatch = line.match(ratRe);
    if (ratMatch) {
      current.rationale = ratMatch[1];
      state = 'rationale';
      continue;
    }

    const wrongHeaderMatch = line.match(wrongHeaderRe);
    if (wrongHeaderMatch) {
      state = 'wrong';
      continue;
    }

    const inWrongSection = state === 'wrong' || ['A', 'B', 'C', 'D'].includes(state);
    const wrongItemMatch = inWrongSection ? line.match(wrongItemRe) : null;
    if (wrongItemMatch) {
      const letter = wrongItemMatch[1];
      current.wrongExplanations[letter] = wrongItemMatch[2];
      state = letter;
      continue;
    }

    if (state === 'rationale') {
      current.rationale += ' ' + line;
    } else if (['A', 'B', 'C', 'D'].includes(state)) {
      current.wrongExplanations[state] += ' ' + line;
    }
  }
  if (current) keys[current.number] = current;
  return keys;
}

function mergeExamText(text) {
  const lines = text.split('\n');
  const { questionLines, keyLines } = splitQuestionsAndKey(lines);
  const questions = parseQuestionLines(questionLines);
  const keys = parseAnswerKeyLines(keyLines);

  const valid = [];
  const errors = [];

  questions.forEach((q) => {
    const choices = ['A', 'B', 'C', 'D'].map((l) => (q.choices[l] || '').trim());
    const key = keys[q.number];
    const errs = [];
    if (!q.stem?.trim()) errs.push('missing question text');
    if (choices.some((c) => !c)) errs.push('missing one or more choices A-D');
    if (!key) errs.push('no matching answer key entry found');
    const answerIndex = key ? 'ABCD'.indexOf(key.letter) : -1;
    if (key && answerIndex === -1) errs.push('invalid answer letter in key');

    if (errs.length) {
      errors.push({ number: q.number, preview: (q.stem || '').slice(0, 90), errors: errs });
      return;
    }

    const choiceExplanations = ['A', 'B', 'C', 'D'].map((letter, i) => {
      if (i === answerIndex) return (key.rationale || '').trim();
      return (key.wrongExplanations[letter] || '').trim();
    });

    valid.push({
      question: q.stem.trim(),
      choices,
      answer: answerIndex,
      explanation: (key.rationale || '').trim(),
      choice_explanations: choiceExplanations,
    });
  });

  return { valid, errors, keyFound: keyLines.length > 0 };
}

const DIFFICULTY_BADGE = { Easy: 'inst-badge inst-badge-success', Medium: 'inst-badge inst-badge-amber', Hard: 'inst-badge inst-badge-danger' };
const CATEGORY_BADGE   = { GenEd: 'inst-badge inst-badge-blue', ProfEd: 'inst-badge inst-badge-purple', Major: 'inst-badge inst-badge-amber' };

const EMPTY_FORM = {
  question: '', category: 'GenEd', subject: '', difficulty: 'Medium',
  choices: ['', '', '', ''], answer: 0, explanation: '',
  choice_explanations: ['', '', '', ''],
};

export default function QuestionBankPage() {
  const { questions, loading, addQuestion, addQuestions, updateQuestion, removeQuestion, bulkRemoveQuestions } = useQuestionBank();
  const { user } = useAuthStore();
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfRawText, setPdfRawText] = useState('');
  const [pdfParsed, setPdfParsed] = useState(null); // { valid, errors, keyFound }
  const [pdfCategory, setPdfCategory] = useState('GenEd');
  const [pdfSubject, setPdfSubject] = useState('');
  const [pdfDifficulty, setPdfDifficulty] = useState('Medium');
  const [pdfCopied, setPdfCopied] = useState(false);
  const [showPdfRaw, setShowPdfRaw] = useState(false);
  const pdfRef = useRef();
  const [editItem,  setEditItem]  = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const filtered = questions.filter((q) => {
    const matchSearch = q.question.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filter === 'All' || q.category === filter;
    const matchDept    = q.category !== 'Major' || q.department === user?.department;
    return matchSearch && matchCat && matchDept;
  });

  const openAdd  = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (q) => {
    setEditItem(q.id);
    setForm({
      question: q.question, category: q.category, subject: q.subject || '',
      difficulty: q.difficulty, choices: [...q.choices], answer: q.answer,
      explanation: q.explanation || '',
      choice_explanations: q.choice_explanations && q.choice_explanations.length === 4
        ? [...q.choice_explanations]
        : ['', '', '', ''],
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditItem(null); };

  const handleChoiceChange = (i, val) => {
    const updated = [...form.choices]; updated[i] = val;
    setForm((p) => ({ ...p, choices: updated }));
  };

  const handleChoiceExplanationChange = (i, val) => {
    const updated = [...form.choice_explanations]; updated[i] = val;
    setForm((p) => ({ ...p, choice_explanations: updated }));
  };

  const handleSave = async () => {
    if (!form.question.trim()) return alert('Question text is required.');
    if (form.choices.some((c) => !c.trim())) return alert('All 4 choices are required.');
    setSaving(true);

    const payload = { ...form, subject: form.subject.trim() || form.category };

    try {
      if (editItem) {
        await updateQuestion(editItem, payload);
      } else {
        await addQuestion(payload);
      }
      closeModal();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question? It will also be removed from any exam that includes it.')) return;
    try {
      await removeQuestion(id);
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to delete question.');
    }
  };

  // ---------- Bulk delete ----------
  // Scoped to whatever category tab is currently active (All / GenEd / ProfEd / Major),
  // so the same filter tabs double as the delete-scope picker — no separate dropdown needed.
  const bulkDeleteCount = filter === 'All'
    ? questions.filter((q) => q.category !== 'Major' || q.department === user?.department).length
    : filtered.length;

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await bulkRemoveQuestions(filter);
      setShowBulkDeleteConfirm(false);
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to delete questions.');
    } finally {
      setBulkDeleting(false);
    }
  };

  // ---------- PDF import flow ----------

  const closeImport = () => {
    setShowImport(false);
    setPdfParsed(null);
    setPdfRawText('');
    setPdfFileName('');
    setPdfCopied(false);
    setShowPdfRaw(false);
    if (pdfRef.current) pdfRef.current.value = '';
  };

  const handlePdfSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFileName(file.name);
    setPdfExtracting(true);
    setPdfParsed(null);
    setPdfRawText('');
    setPdfCopied(false);
    setShowPdfRaw(false);
    try {
      const lines = await extractPdfLines(file);
      const result = mergeExamText(lines.join('\n'));
      setPdfParsed(result);
      setPdfRawText(lines.join('\n'));
      if (result.valid.length === 0) setShowPdfRaw(true);
    } catch (err) {
      console.error(err);
      alert('Failed to read this PDF. It may be corrupted, password-protected, or a scanned image without selectable text.');
    }
    setPdfExtracting(false);
  };

  const handleCopyPdfText = async () => {
    try {
      await navigator.clipboard.writeText(pdfRawText);
      setPdfCopied(true);
      setTimeout(() => setPdfCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Could not copy automatically — please select the text and copy it manually.');
    }
  };

  const handleConfirmPdfImport = async () => {
    if (!pdfParsed?.valid.length) return;
    try {
      await addQuestions(pdfParsed.valid.map((q) => ({
        ...q,
        category: pdfCategory,
        subject: pdfSubject.trim() || pdfCategory,
        difficulty: pdfDifficulty,
      })));
      closeImport();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to import questions.');
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading question bank...</div>;
  }

  return (
    <>
      <div className="inst-topbar">
        <div className="inst-topbar-left">
          <h1>Question Bank</h1>
          <p>{questions.length} questions total — add manually or import from PDF. Major questions are scoped to your department ({user?.department || '—'}).</p>
        </div>
        <div className="inst-topbar-right">
          <button className="inst-btn inst-btn-secondary inst-btn-sm" onClick={() => setShowImport(true)}>
            <Upload size={13} /> Import from PDF
          </button>
          <button className="inst-btn inst-btn-primary inst-btn-sm" onClick={openAdd}>
            <Plus size={13} /> Add Question
          </button>
        </div>
      </div>

      <div className="inst-content">
        <div className="inst-card">
          <div className="inst-card-header">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} className={`inst-btn inst-btn-sm ${filter === cat ? 'inst-btn-primary' : 'inst-btn-secondary'}`} onClick={() => setFilter(cat)}>{cat}</button>
              ))}
              <button
                className="inst-btn inst-btn-sm"
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={bulkDeleteCount === 0}
                style={{ color: 'var(--inst-danger)', borderColor: 'var(--inst-danger)', marginLeft: 4 }}
                title={filter === 'All' ? 'Delete all questions you can see' : `Delete all ${filter} questions`}
              >
                <Trash2 size={13} /> Delete {filter === 'All' ? 'All' : filter} ({bulkDeleteCount})
              </button>
            </div>
            <div className="inst-search">
              <Search size={15} />
              <input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="inst-empty"><BookOpen size={40} /><p>No questions found.</p></div>
          ) : (
            <table className="inst-table">
              <thead>
                <tr>
                  <th style={{ width: '42%' }}>Question</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Difficulty</th>
                  <th>Explanation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{q.question}</td>
                    <td><span className={CATEGORY_BADGE[q.category]}>{q.category === 'Major' && q.department ? `Major (${q.department})` : q.category}</span></td>
                    <td style={{ fontSize: 12.5, color: 'var(--inst-text-sub)' }}>{q.subject || '—'}</td>
                    <td><span className={DIFFICULTY_BADGE[q.difficulty]}>{q.difficulty}</span></td>
                    <td>
                      {q.explanation
                        ? <span className="inst-badge inst-badge-success"><CheckCircle size={11} /> Yes</span>
                        : <span className="inst-badge inst-badge-neutral">No</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="inst-btn-icon" onClick={() => openEdit(q)}><Edit2 size={13} /></button>
                        <button className="inst-btn-icon" onClick={() => handleDelete(q.id)} style={{ color: 'var(--inst-danger)' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="inst-save-bar">
            <p>Showing {filtered.length} of {questions.length} questions</p>
          </div>
        </div>
      </div>

      {/* Bulk Delete Confirm Modal */}
      {showBulkDeleteConfirm && (
        <div className="inst-modal-backdrop" onClick={() => !bulkDeleting && setShowBulkDeleteConfirm(false)}>
          <div className="inst-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="inst-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={17} style={{ color: 'var(--inst-danger)' }} /> Confirm bulk delete
              </h3>
              <button className="inst-btn-icon" onClick={() => setShowBulkDeleteConfirm(false)} disabled={bulkDeleting}><X size={16} /></button>
            </div>
            <div className="inst-modal-body">
              <p style={{ fontSize: 13.5, color: 'var(--inst-text)', lineHeight: 1.6, margin: 0 }}>
                This will permanently delete{' '}
                <strong>{bulkDeleteCount} question{bulkDeleteCount === 1 ? '' : 's'}</strong>
                {filter === 'All' ? ' — every question you can currently see' : <> in the <strong>{filter}</strong> category</>}.
                Any exam that includes these questions will also lose them. This cannot be undone.
              </p>
            </div>
            <div className="inst-modal-footer">
              <button className="inst-btn inst-btn-secondary inst-btn-sm" onClick={() => setShowBulkDeleteConfirm(false)} disabled={bulkDeleting}>
                Cancel
              </button>
              <button
                className="inst-btn inst-btn-sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                style={{ background: 'var(--inst-danger)', color: '#fff', border: 'none' }}
              >
                {bulkDeleting ? 'Deleting...' : `Delete ${bulkDeleteCount} question${bulkDeleteCount === 1 ? '' : 's'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="inst-modal-backdrop" onClick={closeModal}>
          <div className="inst-modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="inst-modal-header">
              <h3>{editItem ? 'Edit Question' : 'Add New Question'}</h3>
              <button className="inst-btn-icon" onClick={closeModal}><X size={16} /></button>
            </div>
            <div className="inst-modal-body">
              <div className="inst-form-group">
                <label className="inst-form-label">Question Text</label>
                <textarea className="inst-form-textarea" placeholder="Enter question here..." value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} />
              </div>
              <div className="inst-three-col">
                <div className="inst-form-group">
                  <label className="inst-form-label">Category</label>
                  <select className="inst-form-select" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    <option value="GenEd">GenEd</option>
                    <option value="ProfEd">ProfEd</option>
                    <option value="Major">Major</option>
                  </select>
                </div>
                <div className="inst-form-group">
                  <label className="inst-form-label">Subject <span className="inst-form-label-sub">· e.g. Mathematics</span></label>
                  <input className="inst-form-input" placeholder="Mathematics, Science, English..." value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
                </div>
                <div className="inst-form-group">
                  <label className="inst-form-label">Difficulty</label>
                  <select className="inst-form-select" value={form.difficulty} onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="inst-form-group">
                <label className="inst-form-label">
                  Answer Choices <span className="inst-form-label-sub">· Select correct answer, explain each</span>
                </label>
                {form.choices.map((choice, i) => (
                  <div key={i} style={{ marginBottom: 10, padding: 10, border: '1px solid var(--inst-border)', borderRadius: 'var(--inst-radius)' }}>
                    <div className="choice-row" style={{ marginBottom: 6 }}>
                      <input type="radio" name="correct-answer" checked={form.answer === i} onChange={() => setForm((p) => ({ ...p, answer: i }))} />
                      <input type="text" placeholder={`Choice ${String.fromCharCode(65 + i)}`} value={choice} onChange={(e) => handleChoiceChange(i, e.target.value)} />
                      {form.answer === i && <span className="choice-correct-label">✓ Correct</span>}
                    </div>
                    <textarea
                      className="inst-form-textarea"
                      placeholder={form.answer === i
                        ? `Why is "${choice || 'this'}" the correct answer?`
                        : `Why is "${choice || 'this'}" incorrect?`}
                      value={form.choice_explanations[i]}
                      onChange={(e) => handleChoiceExplanationChange(i, e.target.value)}
                      style={{ minHeight: 50, fontSize: 12.5 }}
                    />
                  </div>
                ))}
              </div>

              <div className="inst-form-group" style={{ marginBottom: 0 }}>
                <label className="inst-form-label">Explanation / Rationale <span className="inst-form-label-sub">· Shown after exam</span></label>
                <textarea className="inst-form-textarea" placeholder="Explain why the correct answer is right..." value={form.explanation} onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))} style={{ minHeight: 80 }} />
              </div>
            </div>
            <div className="inst-modal-footer">
              <button className="inst-btn inst-btn-secondary inst-btn-sm" onClick={closeModal}>Cancel</button>
              <button className="inst-btn inst-btn-primary inst-btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editItem ? 'Update' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Import Modal */}
      {showImport && (
        <div className="inst-modal-backdrop" onClick={closeImport}>
          <div className="inst-modal" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className="inst-modal-header">
              <h3>Import Questions from PDF</h3>
              <button className="inst-btn-icon" onClick={closeImport}><X size={16} /></button>
            </div>
            <div className="inst-modal-body">
              <div style={{ padding: '10px 14px', background: 'var(--inst-amber-soft, #fff7ed)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, fontSize: 12, color: 'var(--inst-text-sub)', marginBottom: 16, lineHeight: 1.5 }}>
                ⚠️ Works best for reviewers formatted as: numbered questions with A–D choices, followed by an answer key section (e.g. "1. B. Progressivism" + "Rationale: ..." + optional "Wrong Answer Explanation:" per choice). Always check the preview below before importing.
              </div>

              <div
                onClick={() => pdfRef.current.click()}
                style={{ border: '2px dashed var(--inst-border-dark)', borderRadius: 'var(--inst-radius-lg)', padding: '32px 24px', textAlign: 'center', cursor: 'pointer', background: 'var(--inst-bg)', marginBottom: 16 }}
              >
                <FileText size={32} style={{ color: 'var(--inst-text-muted)', marginBottom: 10 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--inst-text)', margin: '0 0 4px' }}>
                  {pdfFileName || 'Click to upload a PDF'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--inst-text-muted)', margin: 0 }}>
                  Text-based PDFs only (not scanned images)
                </p>
                <input ref={pdfRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handlePdfSelect} />
              </div>

              {pdfExtracting && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--inst-text-muted)', fontSize: 13 }}>
                  Reading and parsing PDF...
                </div>
              )}

              {pdfParsed && !pdfExtracting && (
                <div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                    <span className="inst-badge inst-badge-success"><CheckCircle size={11} /> {pdfParsed.valid.length} detected</span>
                    {pdfParsed.errors.length > 0 && (
                      <span className="inst-badge inst-badge-danger"><AlertCircle size={11} /> {pdfParsed.errors.length} need review</span>
                    )}
                    {!pdfParsed.keyFound && (
                      <span className="inst-badge inst-badge-danger"><AlertCircle size={11} /> No "Answer Key" section found</span>
                    )}
                  </div>

                  {pdfParsed.valid.length > 0 && (
                    <div className="inst-three-col" style={{ marginBottom: 16 }}>
                      <div className="inst-form-group" style={{ marginBottom: 0 }}>
                        <label className="inst-form-label">Category <span className="inst-form-label-sub">· applied to all</span></label>
                        <select className="inst-form-select" value={pdfCategory} onChange={(e) => setPdfCategory(e.target.value)}>
                          <option value="GenEd">GenEd</option>
                          <option value="ProfEd">ProfEd</option>
                          <option value="Major">Major</option>
                        </select>
                      </div>
                      <div className="inst-form-group" style={{ marginBottom: 0 }}>
                        <label className="inst-form-label">Subject <span className="inst-form-label-sub">· optional</span></label>
                        <input className="inst-form-input" placeholder="e.g. Professional Education" value={pdfSubject} onChange={(e) => setPdfSubject(e.target.value)} />
                      </div>
                      <div className="inst-form-group" style={{ marginBottom: 0 }}>
                        <label className="inst-form-label">Difficulty</label>
                        <select className="inst-form-select" value={pdfDifficulty} onChange={(e) => setPdfDifficulty(e.target.value)}>
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {pdfParsed.valid.length > 0 && (
                    <div style={{ border: '1px solid var(--inst-border)', borderRadius: 'var(--inst-radius)', overflow: 'hidden', maxHeight: 260, overflowY: 'auto', marginBottom: 12 }}>
                      {pdfParsed.valid.slice(0, 25).map((q, i) => (
                        <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--inst-border)', fontSize: 12.5 }}>
                          <div style={{ fontWeight: 600, color: 'var(--inst-text)', marginBottom: 6 }}>{i + 1}. {q.question}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
                            {q.choices.map((c, ci) => (
                              <div key={ci}>
                                <span style={{ color: ci === q.answer ? 'var(--inst-accent, #16a34a)' : 'var(--inst-text-sub)', fontWeight: ci === q.answer ? 700 : 400 }}>
                                  {String.fromCharCode(65 + ci)}. {c} {ci === q.answer ? '✓' : ''}
                                </span>
                                {q.choice_explanations?.[ci] && (
                                  <div style={{ fontSize: 11, color: 'var(--inst-text-muted)', fontStyle: 'italic', marginLeft: 18 }}>
                                    {q.choice_explanations[ci]}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {pdfParsed.valid.length > 25 && (
                        <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--inst-text-muted)' }}>
                          + {pdfParsed.valid.length - 25} more not shown
                        </div>
                      )}
                    </div>
                  )}

                  {pdfParsed.errors.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--inst-danger)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                        Skipped — need manual entry
                      </div>
                      <div style={{ border: '1px solid var(--inst-border)', borderRadius: 'var(--inst-radius)', overflow: 'hidden', maxHeight: 160, overflowY: 'auto' }}>
                        {pdfParsed.errors.map((e, i) => (
                          <div key={i} style={{ padding: '8px 16px', borderBottom: '1px solid var(--inst-border)', fontSize: 12 }}>
                            <strong>Item {e.number}:</strong> {e.preview}… — {e.errors.join('; ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    className="inst-btn inst-btn-secondary inst-btn-sm"
                    onClick={() => setShowPdfRaw((v) => !v)}
                    style={{ marginBottom: showPdfRaw ? 10 : 0 }}
                  >
                    {showPdfRaw ? 'Hide' : 'Show'} raw extracted text
                  </button>

                  {showPdfRaw && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                        <button className="inst-btn inst-btn-secondary inst-btn-sm" onClick={handleCopyPdfText}>
                          {pdfCopied ? <><ClipboardCheck size={13} /> Copied</> : <><Copy size={13} /> Copy all</>}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={pdfRawText}
                        style={{
                          width: '100%', boxSizing: 'border-box', minHeight: 200, maxHeight: 300,
                          padding: 12, borderRadius: 'var(--inst-radius)', border: '1px solid var(--inst-border)',
                          fontSize: 12, fontFamily: 'ui-monospace, monospace', color: 'var(--inst-text)',
                          background: 'var(--inst-bg)', resize: 'vertical', lineHeight: 1.6,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="inst-modal-footer">
              <button className="inst-btn inst-btn-secondary inst-btn-sm" onClick={closeImport}>Cancel</button>
              {pdfParsed?.valid.length > 0 && (
                <button className="inst-btn inst-btn-primary inst-btn-sm" onClick={handleConfirmPdfImport}>
                  <CheckCircle size={13} /> Import {pdfParsed.valid.length} Questions
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}