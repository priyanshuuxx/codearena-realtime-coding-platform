import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { CheckCircle2, Clock, Code2, Play, Send, ShieldCheck, Sparkles, Target, Wrench } from 'lucide-react';
import AppLayout from '../components/AppLayout.jsx';
import Panel from '../components/Panel.jsx';
import QuestionLock from '../components/QuestionLock.jsx';
import { api } from '../lib/api.js';

const codingStarter = (title = 'Interview Problem') => `function solve(input) {
  // ${title}
  // Explain approach, handle edge cases, then optimize.
  return input;
}

console.log(solve("demo input"));`;

function formatTimer(totalSeconds) {
  const minutes = Math.floor(Math.max(totalSeconds, 0) / 60).toString().padStart(2, '0');
  const seconds = Math.floor(Math.max(totalSeconds, 0) % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function InterviewPage() {
  const [round, setRound] = useState(null);
  const [session, setSession] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('MEDIUM');
  const [activeSection, setActiveSection] = useState('coding');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [codingCode, setCodingCode] = useState(() => codingStarter());
  const [debugCode, setDebugCode] = useState('');
  const [customInput, setCustomInput] = useState('demo input');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [results, setResults] = useState({});
  const [pageError, setPageError] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/platform/interview')
      .then(({ data }) => setRound(data.round))
      .catch(() => setPageError('Could not load interview plan. Make sure the backend server is running.'));
  }, []);

  useEffect(() => {
    if (!session || remainingSeconds <= 0) return undefined;

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [remainingSeconds, session]);

  async function startSession() {
    setIsStarting(true);
    setPageError('');

    try {
      const { data } = await api.post('/platform/interview/session', { level: selectedLevel });
      setSession(data.session);
      setRemainingSeconds(data.session.durationSeconds);
      setCodingCode(codingStarter(data.session.sections.coding.title));
      setDebugCode(data.session.sections.debugging.buggyCode);
      setSelectedAnswers({});
      setResults({});
      setActiveSection('coding');
    } catch (error) {
      setPageError(error.response?.data?.message || 'Could not start interview session.');
    } finally {
      setIsStarting(false);
    }
  }

  async function runCoding() {
    setIsRunning(true);
    setPageError('');

    try {
      const { data } = await api.post('/submissions/run', {
        problemId: session?.sections.coding.id,
        code: codingCode,
        language: 'javascript',
        input: customInput,
      });
      setResults((current) => ({ ...current, coding: data }));
    } catch (error) {
      setPageError(error.response?.data?.message || 'Run failed. Check the backend server and your login session.');
    } finally {
      setIsRunning(false);
    }
  }

  async function submitCoding() {
    if (!session) return;
    setIsSubmitting(true);
    setPageError('');

    try {
      const { data } = await api.post('/submissions/submit', {
        problemId: session.sections.coding.id,
        code: codingCode,
        language: 'javascript',
      });
      setResults((current) => ({ ...current, coding: { ...data.submission, output: data.message } }));
    } catch (error) {
      setPageError(error.response?.data?.message || 'Submit failed. Check the backend server and your login session.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitDebugging() {
    if (!session) return;
    setIsSubmitting(true);
    setPageError('');

    try {
      const { data } = await api.post(`/debugging/${session.sections.debugging.id}/submit`, {
        code: debugCode,
      });
      setResults((current) => ({ ...current, debugging: data }));
    } catch (error) {
      setPageError(error.response?.data?.message || 'Debug submit failed. Check the backend server and your login session.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitMcq(questionId) {
    setPageError('');

    try {
      const { data } = await api.post(`/mcq/${questionId}/attempt`, {
        answer: selectedAnswers[questionId],
      });
      setResults((current) => ({
        ...current,
        mcq: { ...(current.mcq || {}), [questionId]: data },
      }));
    } catch (error) {
      setPageError(error.response?.data?.message || 'Could not check this MCQ answer.');
    }
  }

  const completedCount = ['coding', 'debugging'].filter((key) => results[key]?.verdict === 'ACCEPTED').length +
    Object.values(results.mcq || {}).filter((item) => item.isCorrect).length;

  return (
    <AppLayout eyebrow="Interview Practice" title="Mixed Round">
      {pageError && (
        <Panel className="mb-5 border-rose-100 bg-rose-50">
          <p className="text-sm font-semibold text-rose-700">{pageError}</p>
        </Panel>
      )}

      <Panel className="mb-5 overflow-hidden bg-gradient-to-br from-white to-indigo-50">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" size={30} />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Focused mock interview</p>
            </div>
            <h3 className="mt-4 text-3xl font-bold tracking-tight">{round?.title || 'SDE Mixed Interview Round'}</h3>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Start a timed round with real coding, debugging, and technical MCQ questions from your CodeArena catalog.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                <button
                  key={level}
                  className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${selectedLevel === level ? 'border-indigo-200 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
            <button className="mt-6 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={startSession} disabled={isStarting}>
              <Play size={17} />
              {isStarting ? 'Starting...' : session ? 'Restart Interview Session' : 'Start Interview Session'}
            </button>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{session ? 'Live Timer' : 'Readiness Score'}</p>
            <p className="mt-2 font-mono text-4xl font-bold text-indigo-600">{session ? formatTimer(remainingSeconds) : '78%'}</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-indigo-600 transition-all" style={{ width: session ? `${Math.max((remainingSeconds / session.durationSeconds) * 100, 0)}%` : '78%' }} />
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {session ? `${completedCount} checks completed in this session.` : 'Practice graphs and DP for stronger product-company rounds.'}
            </p>
          </div>
        </div>
      </Panel>

      {session ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <Panel className="overflow-hidden">
            <div className="mb-5 flex flex-wrap gap-2">
              {[
                ['coding', Code2, 'Coding'],
                ['debugging', Wrench, 'Debugging'],
                ['mcq', Target, 'MCQs'],
              ].map(([key, Icon, label]) => (
                <button
                  key={key}
                  className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition ${activeSection === key ? 'border-indigo-200 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                  type="button"
                  onClick={() => setActiveSection(key)}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {activeSection === 'coding' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-950">{session.sections.coding.title}</h3>
                <QuestionLock><p className="mt-2 leading-7 text-slate-600">{session.sections.coding.description}</p></QuestionLock>
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                  <Editor height="390px" language="javascript" theme="vs-dark" value={codingCode} onChange={(value) => setCodingCode(value || '')} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }} />
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_150px_150px]">
                  <textarea className="min-h-24 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-indigo-300" value={customInput} onChange={(event) => setCustomInput(event.target.value)} />
                  <button className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60" type="button" onClick={runCoding} disabled={isRunning || isSubmitting}>
                    <Play size={18} />
                    {isRunning ? 'Running...' : 'Run'}
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60" type="button" onClick={submitCoding} disabled={isRunning || isSubmitting}>
                    <Send size={18} />
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'debugging' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-950">{session.sections.debugging.title}</h3>
                <QuestionLock><p className="mt-2 leading-7 text-slate-600">{session.sections.debugging.statement}</p><p className="mt-2 text-sm font-semibold text-slate-500">Expected: {session.sections.debugging.expectedBehavior}</p></QuestionLock>
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                  <Editor height="390px" language="javascript" theme="vs-dark" value={debugCode} onChange={(value) => setDebugCode(value || '')} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }} />
                </div>
                <button className="mt-4 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60" type="button" onClick={submitDebugging} disabled={isSubmitting}>
                  <Wrench size={18} />
                  {isSubmitting ? 'Checking...' : 'Submit Fix'}
                </button>
              </div>
            )}

            {activeSection === 'mcq' && (
              <div className="grid gap-4">
                {session.sections.mcqs.map((question, index) => (
                  <div key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Question {index + 1}</p>
                    <QuestionLock><h3 className="mt-2 font-semibold text-slate-950">{question.question}</h3></QuestionLock>
                    <div className="mt-3 grid gap-2">
                      {question.options.map((option, optionIndex) => (
                        <button
                          key={option}
                          className={`rounded-md border px-3 py-2 text-left text-sm transition ${selectedAnswers[question.id] === optionIndex ? 'border-indigo-200 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-white'}`}
                          type="button"
                          onClick={() => setSelectedAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <button className="mt-3 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" type="button" onClick={() => submitMcq(question.id)} disabled={selectedAnswers[question.id] === undefined}>
                      Check Answer
                    </button>
                    {results.mcq?.[question.id] && (
                      <p className={`mt-3 text-sm font-semibold ${results.mcq[question.id].isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {results.mcq[question.id].isCorrect ? 'Correct.' : 'Incorrect.'} {results.mcq[question.id].explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="text-indigo-600" size={20} />
              Interview Coach
            </h3>
            <div className="mt-4 space-y-3">
              {session.interviewerNotes.map((note) => (
                <div key={note} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                  <CheckCircle2 className="mt-0.5 text-indigo-600" size={18} />
                  {note}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Latest Result</p>
              <p className="mt-2 text-sm text-slate-600">
                {(results[activeSection]?.output || results[activeSection]?.feedback || results[activeSection]?.verdict || 'No submission yet.')}
              </p>
            </div>
          </Panel>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {(round?.sections || []).map((section) => (
            <Panel key={section.type}>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{section.type}</p>
              <h3 className="mt-3 text-xl font-bold">{section.title}</h3>
              <p className="mt-2 text-slate-500">{section.count} task included</p>
            </Panel>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

export default InterviewPage;
