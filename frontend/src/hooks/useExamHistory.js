import { useState, useEffect, useCallback } from 'react';
import { examApi } from '../api/examApi';

/**
 * Attempt shape (mapped from backend ExamAttempt):
 * {
 *   id, examType, label, short, score, total, percentage, passed,
 *   timeTaken, autoSubmit, date (ISOString),
 *   subjectBreakdown: { [subject]: { correct, total } }
 * }
 */
function mapAttemptFromApi(a) {
  return {
    id: a.id,
    examType: a.exam_type,
    label: a.label,
    short: a.category, // GenEd / ProfEd / Major
    score: a.score,
    total: a.total,
    percentage: a.percentage,
    passed: a.passed,
    timeTaken: a.time_taken_seconds,
    autoSubmit: a.auto_submit,
    date: a.created_at,
    subjectBreakdown: a.subject_breakdown || {},
  };
}

export default function useExamHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await examApi.getAttemptHistory();
      // Newest-first, same ordering the dashboard/results pages expect
      setHistory(data.map(mapAttemptFromApi));
    } catch (err) {
      console.error('Failed to load exam history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Aggregates every attempt's subjectBreakdown into one summary per subject:
  // { [subject]: { correct, total, percentage, attempts } }
  const getSubjectSummary = () => {
    const summary = {};
    history.forEach((attempt) => {
      Object.entries(attempt.subjectBreakdown || {}).forEach(([subject, s]) => {
        if (!summary[subject]) summary[subject] = { correct: 0, total: 0, attempts: 0 };
        summary[subject].correct += s.correct;
        summary[subject].total += s.total;
        summary[subject].attempts += 1;
      });
    });
    Object.values(summary).forEach((s) => {
      s.percentage = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    });
    return summary;
  };

  return { history, loading, getSubjectSummary, refetch: fetchHistory };
}