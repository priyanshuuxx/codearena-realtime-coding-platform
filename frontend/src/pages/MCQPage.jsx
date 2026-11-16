import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import Panel from '../components/Panel.jsx';
import QuestionLock from '../components/QuestionLock.jsx';
import { api } from '../lib/api.js';

function MCQPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');

  useEffect(() => {
    api.get('/mcq').then(({ data }) => setQuestions(data.questions));
  }, []);

  async function submitAnswer(questionId) {
    const { data } = await api.post(`/mcq/${questionId}/attempt`, { answer: answers[questionId] });
    setResults((current) => ({ ...current, [questionId]: data }));
  }

  const categories = Array.from(new Set(questions.map((question) => question.category))).sort();
  const filteredQuestions = questions.filter((question) => {
    const query = search.toLowerCase();
    const matchesSearch =
      question.question.toLowerCase().includes(query) ||
      question.category.toLowerCase().includes(query);
    const matchesCategory = category === 'ALL' || question.category === category;
    const matchesDifficulty = difficulty === 'ALL' || question.difficulty === difficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <AppLayout eyebrow="Technical Skills" title="MCQ Practice">
      <Panel className="mb-5">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <input
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search MCQ topic"
          />
          <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="ALL">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="ALL">All levels</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
        <p className="mt-3 text-sm text-slate-500">{filteredQuestions.length} of {questions.length} technical questions</p>
      </Panel>
      <div className="grid gap-5 lg:grid-cols-3">
        {filteredQuestions.map((question) => (
          <Panel key={question.id}>
            <div className="flex items-center justify-between gap-3">
              <span className="rounded bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                {question.category}
              </span>
              <span className="text-xs text-slate-400">{question.difficulty}</span>
            </div>
            <QuestionLock><h3 className="mt-4 text-lg font-semibold">{question.question}</h3></QuestionLock>
            <div className="mt-4 space-y-2">
              {question.options.map((option, index) => (
                <label key={option} className="flex cursor-pointer gap-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 transition hover:bg-indigo-50">
                  <input
                    type="radio"
                    name={question.id}
                    value={index}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: index }))}
                  />
                  {option}
                </label>
              ))}
            </div>
            <button className="mt-4 rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700" type="button" onClick={() => submitAnswer(question.id)}>
              Check Answer
            </button>
            {results[question.id] && (
              <div className="mt-4 rounded border border-white/10 bg-white/6 p-3 text-sm">
                <p className={results[question.id].isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                  {results[question.id].isCorrect ? 'Correct' : 'Needs review'}
                </p>
                <p className="mt-2 text-slate-400">{results[question.id].explanation}</p>
              </div>
            )}
          </Panel>
        ))}
      </div>
    </AppLayout>
  );
}

export default MCQPage;
