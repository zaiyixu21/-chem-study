(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ChemCore = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  function normalize(keys) {
    return Array.isArray(keys) ? [...new Set(keys.filter(k => typeof k === 'string'))].sort() : [];
  }
  function grade(question, selection) {
    const keys = normalize(selection);
    return keys.length > 0 && JSON.stringify(keys) === JSON.stringify(normalize(question.answer));
  }
  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function sample(items, count, random = Math.random) {
    return shuffle(items, random).slice(0, Math.max(0, Math.min(items.length, Math.floor(count))));
  }
  function summarize(questions, answers) {
    const correct = questions.filter(q => grade(q, answers[q.id])).length;
    const answered = questions.filter(q => normalize(answers[q.id]).length > 0).length;
    return {total: questions.length, correct, answered, unanswered: questions.length - answered,
      incorrect: questions.length - correct, score: questions.length ? Math.round(correct / questions.length * 10000) / 100 : 0};
  }
  function remainingSeconds(deadline, now = Date.now()) {
    return Math.max(0, Math.ceil((deadline - now) / 1000));
  }
  function makeRecord(previous, correct, selection, now = Date.now()) {
    return {attempts: (previous?.attempts || 0) + 1, correctAttempts: (previous?.correctAttempts || 0) + Number(correct),
      correct: Boolean(correct), selection: normalize(selection), lastAt: now};
  }
  return {normalize, grade, shuffle, sample, summarize, remainingSeconds, makeRecord};
});
