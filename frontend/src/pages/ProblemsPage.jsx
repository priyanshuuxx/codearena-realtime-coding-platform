import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { CheckCircle2, ChevronDown, FileCode2, Maximize2, Play, RotateCcw, Send, TerminalSquare } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import Panel from '../components/Panel.jsx';
import QuestionLock from '../components/QuestionLock.jsx';
import { api } from '../lib/api.js';

const languageStarters = {
  javascript: (title = 'Selected Problem') => `function solve(input) {
  // ${title}
  // Write your JavaScript solution here.
  return input;
}

console.log(solve("demo input"));`,
  python: (title = 'Selected Problem') => `def solve(data: str):
    # ${title}
    # Write your Python solution here.
    return data

print(solve("demo input"))`,
  cpp: (title = 'Selected Problem') => `#include <bits/stdc++.h>
using namespace std;

// ${title}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string input;
    getline(cin, input);
    cout << input << "\\n";
    return 0;
}`,
  java: (title = 'Selected Problem') => `import java.io.*;
import java.util.*;

public class Main {
    // ${title}
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine();
        System.out.println(input);
    }
}`,
};

function getStarterCode(language, problem) {
  return languageStarters[language](problem?.title);
}

function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(() => getStarterCode('javascript'));
  const [input, setInput] = useState('demo input');
  const [result, setResult] = useState(null);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [difficulty, setDifficulty] = useState('ALL');
  const [topic, setTopic] = useState('ALL');
  const [pageError, setPageError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);

  useEffect(() => {
    api.get('/problems').then(({ data }) => {
      setProblems(data.problems);
      setSelected(data.problems[0]);
      setCode(getStarterCode('javascript', data.problems[0]));
    }).catch(() => setPageError('Could not load problems. Make sure the backend server is running.'));
  }, []);

  const topics = useMemo(() => Array.from(new Set(problems.flatMap((problem) => problem.tags))).sort(), [problems]);
  const filteredProblems = problems.filter((problem) => {
    const query = search.toLowerCase();
    return (problem.title.toLowerCase().includes(query) || problem.tags.join(' ').toLowerCase().includes(query) || problem.description.toLowerCase().includes(query)) && (difficulty === 'ALL' || problem.difficulty === difficulty) && (topic === 'ALL' || problem.tags.includes(topic));
  });

  async function runCode() {
    if (!selected) return;
    setIsRunning(true); setPageError('');
    try {
      const { data } = await api.post('/submissions/run', { problemId: selected.id, code, language, input });
      setResult(data);
    } catch (error) {
      const message = error.response?.data?.message || 'Run failed. Check your login session and backend server.';
      setPageError(message); setResult({ verdict: 'RUN_FAILED', stderr: message, judge: 'request' });
    } finally { setIsRunning(false); }
  }

  async function submitCode() {
    if (!selected) return;
    setIsSubmitting(true); setPageError('');
    try {
      const { data } = await api.post('/submissions/submit', { problemId: selected.id, code, language });
      setResult({ ...data.submission, output: data.message, judge: 'submission' });
    } catch (error) {
      const message = error.response?.data?.message || 'Submit failed. Check your login session and backend server.';
      setPageError(message); setResult({ verdict: 'SUBMIT_FAILED', stderr: message, judge: 'request' });
    } finally { setIsSubmitting(false); }
  }

  function selectProblem(problem) {
    setSelected(problem); setCode(getStarterCode(language, problem)); setResult(null); setPageError('');
  }

  function changeLanguage(event) {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage); setCode(getStarterCode(nextLanguage, selected)); setResult(null);
  }

  const verdictTone = result?.verdict === 'ACCEPTED' ? 'accepted' : result?.verdict?.includes('FAILED') || result?.verdict === 'WRONG_ANSWER' ? 'failed' : 'pending';

  return (
    <AppLayout eyebrow="Coding Problems" title="Problem Workspace" variant="workspace">
      <div className="workspace-page">
        <div className="workspace-toolbar"><div className="workspace-toolbar-title"><FileCode2 size={18} /><span>Problem Set</span><span className="workspace-divider">/</span><span className="workspace-muted">Interview track</span></div><div className="workspace-toolbar-actions"><span className="workspace-live-dot" /> Autosave on <span className="workspace-divider" /> {selected ? `${selected.difficulty} difficulty` : 'Loading...'}</div></div>
        {pageError && <div className="workspace-alert">{pageError}</div>}
        <div className="workspace-grid">
          <Panel className="workspace-panel problem-browser">
            <div className="workspace-panel-heading"><div><p className="workspace-kicker">Problem list</p><h3>{filteredProblems.length} <span>of {problems.length || '...'} challenges</span></h3></div><button className="workspace-icon-button" type="button" onClick={() => { setSearch(''); setDifficulty('ALL'); setTopic('ALL'); }} aria-label="Reset problem filters" title="Reset filters"><RotateCcw size={15} /></button></div>
            <div className="workspace-filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or pattern" aria-label="Search problems" /><div className="workspace-filter-row"><label><span>Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="ALL">All levels</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select><ChevronDown size={14} /></label><label><span>Topic</span><select value={topic} onChange={(event) => setTopic(event.target.value)}><option value="ALL">All topics</option>{topics.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={14} /></label></div></div>
            <div className="problem-list">{filteredProblems.map((problem) => <button key={problem.id} className={`problem-row ${selected?.id === problem.id ? 'is-selected' : ''}`} type="button" onClick={() => selectProblem(problem)}><div className="problem-row-main"><span className="problem-status"><CheckCircle2 size={15} /></span><span className="problem-title">{problem.title}</span><span className={`difficulty difficulty-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span></div><p>{problem.tags.join(' · ')}</p></button>)}</div>
          </Panel>
          <div className="workspace-main">
            <Panel className="workspace-panel problem-brief"><div className="brief-topline"><span className="workspace-kicker">Challenge {selected?.order ? `#${String(selected.order).padStart(3, '0')}` : ''}</span><span className="workspace-unsolved">○ Unsolved</span></div><QuestionLock className="brief-layout"><div><h1>{selected?.title || 'Loading problem...'}</h1><p>{selected?.description || 'Preparing your challenge workspace.'}</p><div className="tag-row">{(selected?.tags || []).map((tag) => <span key={tag}>{tag}</span>)}</div></div><label className="language-picker"><span>Language</span><select value={language} onChange={changeLanguage}><option value="javascript">JavaScript</option><option value="python">Python</option><option value="cpp">C++</option><option value="java">Java</option></select><ChevronDown size={15} /></label></QuestionLock><QuestionLock className="problem-details"><div><span>Constraints</span><p>{selected?.constraints || 'Choose an efficient solution that handles edge cases and large inputs.'}</p></div><div><span>Interview focus</span><p>Return the expected result for every valid input. Check empty, duplicate, boundary, and maximum-size cases.</p></div></QuestionLock><QuestionLock className="sample-grid"><div><span>Sample input</span><pre>{selected?.sampleInput || '—'}</pre></div><div><span>Expected output</span><pre>{selected?.sampleOutput || '—'}</pre></div></QuestionLock></Panel>
            <Panel className={`workspace-panel editor-panel ${isEditorFullscreen ? 'editor-expanded' : ''}`}><div className="editor-heading"><div className="editor-tab"><span className="file-dot" /> solution.{language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : language}</div><div className="editor-actions"><button type="button" onClick={() => setCode(getStarterCode(language, selected))} title="Reset code" aria-label="Reset code"><RotateCcw size={16} /></button><button type="button" onClick={() => setIsEditorFullscreen((current) => !current)} title="Toggle editor size" aria-label="Toggle editor size"><Maximize2 size={16} /></button></div></div><div className="editor-frame"><Editor height={isEditorFullscreen ? 'calc(100vh - 210px)' : '470px'} language={language === 'cpp' ? 'cpp' : language} theme="vs-dark" value={code} onChange={(value) => setCode(value || '')} options={{ minimap: { enabled: true }, fontSize: 14, lineHeight: 22, padding: { top: 18 }, smoothScrolling: true, scrollBeyondLastLine: false, fontFamily: 'JetBrains Mono, SFMono-Regular, Consolas, monospace' }} /></div><div className="console-bar"><div className="console-tabs"><span className="active"><TerminalSquare size={15} /> Testcase</span><span>Test result</span></div><span className="console-hint">Input is used by Run Code</span></div><div className="editor-footer"><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Custom input" aria-label="Custom input" /><div className="action-stack"><button className="run-button" type="button" onClick={runCode} disabled={isRunning || isSubmitting || !selected}><Play size={16} />{isRunning ? 'Running...' : 'Run Code'}</button><button className="submit-button" type="button" onClick={submitCode} disabled={isRunning || isSubmitting || !selected}><Send size={16} />{isSubmitting ? 'Submitting...' : 'Submit solution'}</button></div></div>{result && <div className={`result-panel ${verdictTone}`}><div><strong>{result.verdict}</strong><p>{result.output || result.stderr || 'The judge completed without additional output.'}</p></div><span>{result.runtimeMs || '—'}ms<br /><small>{result.judge || 'judge'}</small></span></div>}</Panel>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default ProblemsPage;
