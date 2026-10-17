import { useState, useEffect, useCallback } from 'react';
import { questionApi } from '../api/questionApi';

/**
 * Question shape (mula sa backend):
 * {
 *   id, question, category ('GenEd'|'ProfEd'|'Major'), subject, difficulty,
 *   choices: [4 strings], answer: 0-3, explanation, choice_explanations: [4 strings],
 *   department ('CIT'|'CTE'|'BOTH'|null — Major lang)
 * }
 * Ascending ang order (upload order), kaya sa dulo idinaragdag ang bago.
 */
export default function useQuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await questionApi.getQuestions();
        setQuestions(data);
      } catch (err) {
        console.error('Failed to load question bank:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const addQuestion = useCallback(async (payload) => {
    const created = await questionApi.createQuestion(payload);
    setQuestions((prev) => [...prev, created]);
    return created;
  }, []);

  const addQuestions = useCallback(async (payloads) => {
    const created = await questionApi.bulkCreateQuestions(payloads);
    setQuestions((prev) => [...prev, ...created]);
    return created;
  }, []);

  const updateQuestion = useCallback(async (id, payload) => {
    const updated = await questionApi.updateQuestion(id, payload);
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
    return updated;
  }, []);

  const removeQuestion = useCallback(async (id) => {
    await questionApi.deleteQuestion(id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  return { questions, loading, addQuestion, addQuestions, updateQuestion, removeQuestion };
}
