import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Bug, Send } from 'lucide-react';
import AppLayout from '../components/AppLayout.jsx';
import Panel from '../components/Panel.jsx';
import QuestionLock from '../components/QuestionLock.jsx';
import { api } from '../lib/api.js';

function DebuggingPage() {
  const [challenges, setChallenges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');

  useEffect(() => {
    api.get('/debugging').then(({ data }) => {
      setChallenges(data.challenges);
      setSelected(data.challenges[0]);
      setCode(data.challenges[0]?.buggyCode || '');
    });
  }, []);

  function chooseChallenge(challenge) {
    setSelected(challenge);
    setCode(challenge.buggyCode);
    setResult(null);
  }

  const filteredChallenges = challenges.filter((challenge) => {
    const query = search.toLowerCase();
    const matchesSearch =
      challenge.title.toLowerCase().includes(query) ||
      challenge.errorType.toLowerCase().includes(query) ||
      challenge.statement.toLowerCase().includes(query);
    const matchesDifficulty = difficulty === 'ALL' || challenge.difficulty === difficulty;

    return matchesSearch && matchesDifficulty;
  });

  async function submitFix() {
    const { data } = await api.post(`/debugging/${selected.id}/submit`, { code });
    setResult(data);
  }

  return (
    <AppLayout eyebrow="Debug Arena" title="Fix Broken Code">
      <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
        <Panel>
          <h3 className="text-lg font-semibold">Challenges</h3>
          <p className="mt-1 text-sm text-slate-400">{filteredChallenges.length} of {challenges.length} debugging tasks</p>
          <div className="mt-4 grid gap-3">
            <input
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bug type"
            />
            <select
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              <option value="ALL">All levels</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div className="mt-4 max-h-[680px] space-y-3 overflow-y-auto pr-1">
            {filteredChallenges.map((challenge) => (
              <button
                key={challenge.id}
                className={`w-full rounded border p-4 text-left transition ${
                  selected?.id === challenge.id
                    ? 'border-indigo-200 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
                type="button"
                onClick={() => chooseChallenge(challenge)}
              >
                <p className="font-semibold">{challenge.title}</p>
                <p className="mt-2 text-sm text-slate-500">{challenge.errorType}</p>
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-start gap-3">
            <Bug className="mt-1 text-rose-600" />
            <div>
              <h3 className="text-2xl font-bold">{selected?.title}</h3>
              <QuestionLock><p className="mt-2 text-slate-600">{selected?.statement}</p><p className="mt-2 text-sm text-indigo-600">{selected?.expectedBehavior}</p></QuestionLock>
            </div>
          </div>
          <div className="h-[430px] overflow-hidden rounded border border-white/10">
            <Editor
              height="430px"
              language="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
            />
          </div>
          <button className="mt-4 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700" type="button" onClick={submitFix}>
            <Send size={18} />
            Submit Fix
          </button>
          {result && (
            <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-indigo-600">{result.verdict}</p>
              <p className="mt-2 text-sm text-slate-600">{result.feedback}</p>
            </div>
          )}
        </Panel>
      </div>
    </AppLayout>
  );
}

export default DebuggingPage;
