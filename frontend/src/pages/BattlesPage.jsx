import { useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Bot, Clock, Copy, Link2, Play, Send, Swords, Trophy, Users, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import AppLayout from '../components/AppLayout.jsx';
import Panel from '../components/Panel.jsx';
import { api } from '../lib/api.js';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:5050';

const levelOptions = [
  {
    level: 'EASY',
    title: 'Warm-up Battle',
    copy: 'Beginner-friendly arrays, strings, and hashing under light pressure.',
  },
  {
    level: 'MEDIUM',
    title: 'Interview Battle',
    copy: 'Balanced DSA pressure for real technical interview practice.',
  },
  {
    level: 'HARD',
    title: 'Final Round Battle',
    copy: 'Advanced patterns with tighter execution and faster bot progress.',
  },
];

const starterCode = {
  javascript: (title = 'Battle Problem') => `function solve(input) {
  // ${title}
  // Build your winning solution here.
  return input;
}

console.log(solve("demo input"));`,
  python: (title = 'Battle Problem') => `def solve(data: str):
    # ${title}
    # Build your winning solution here.
    return data

print(solve("demo input"))`,
  cpp: (title = 'Battle Problem') => `#include <bits/stdc++.h>
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
  java: (title = 'Battle Problem') => `import java.io.*;
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

function getStarterCode(language, battle) {
  return starterCode[language](battle?.problemTitle);
}

function formatTimer(totalSeconds) {
  const minutes = Math.floor(Math.max(totalSeconds, 0) / 60).toString().padStart(2, '0');
  const seconds = Math.floor(Math.max(totalSeconds, 0) % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function BattlesPage() {
  const [searchParams] = useSearchParams();
  const [battles, setBattles] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [activeBattle, setActiveBattle] = useState(null);
  const [mobileBattleTab, setMobileBattleTab] = useState('code');
  const [isLevelOpen, setIsLevelOpen] = useState(false);
  const [isPrivateRoomOpen, setIsPrivateRoomOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('MEDIUM');
  const [matchNotice, setMatchNotice] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);
  const [realtimeNotice, setRealtimeNotice] = useState(null);
  const [privateRoom, setPrivateRoom] = useState(null);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState(() => searchParams.get('room') || '');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [botProgress, setBotProgress] = useState(0);
  const [battleLanguage, setBattleLanguage] = useState('javascript');
  const [battleCode, setBattleCode] = useState(() => getStarterCode('javascript'));
  const [battleInput, setBattleInput] = useState('demo input');
  const [battleResult, setBattleResult] = useState(null);
  const [battleError, setBattleError] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const socketRef = useRef(null);
  const finishedBattleIds = useRef(new Set());

  const isBattleFinished = Boolean(battleResult?.finished);
  const botStep = useMemo(() => {
    if (activeBattle?.level === 'HARD') return 4;
    if (activeBattle?.level === 'MEDIUM') return 3;
    return 2;
  }, [activeBattle?.level]);

  async function loadBattles() {
    const { data } = await api.get('/battles');
    setBattles(data.battles);
  }

  async function loadBattleHistory() {
    const { data } = await api.get('/battles/history');
    setBattleHistory(data.history || []);
  }

  async function finishBattle(result, ratingDelta = 0) {
    if (!activeBattle || finishedBattleIds.current.has(activeBattle.id)) return;
    finishedBattleIds.current.add(activeBattle.id);
    try {
      await api.post(`/battles/${activeBattle.id}/finish`, { result, ratingDelta });
      await loadBattleHistory();
    } catch {
      finishedBattleIds.current.delete(activeBattle.id);
      setBattleError('The result could not be saved. Please retry while this battle is open.');
    }
  }

  function startBattle(battle) {
    setActiveBattle(battle);
    setMobileBattleTab('code');
    setRemainingSeconds(battle.durationSeconds || 900);
    setBotProgress(battle.progress || 0);
    setBattleLanguage('javascript');
    setBattleCode(getStarterCode('javascript', battle));
    setBattleInput('demo input');
    setBattleResult(null);
    setBattleError('');
  }

  async function findBattle(level) {
    setIsMatching(true);
    setBattleError('');

    try {
      const { data } = await api.post('/battles/matchmake', { type: 'CODING', level });
      setBattles((current) => [data.battle, ...current.filter((battle) => battle.id !== data.battle.id)]);
      setMatchNotice(data.battle.matchMessage);
      setIsLevelOpen(false);
      startBattle(data.battle);
    } catch (error) {
      setBattleError(error.response?.data?.message || 'Battle matchmaking failed. Please try again.');
    } finally {
      setIsMatching(false);
    }
  }

  async function createPrivateRoom() {
    setIsCreatingRoom(true);
    setBattleError('');

    try {
      const { data } = await api.post('/battles/private-rooms', {
        level: selectedLevel,
        origin: window.location.origin,
      });
      setPrivateRoom(data.room);
      setInviteLink(data.inviteLink);
      setInviteCodeInput(data.room.roomCode);
      setMatchNotice(`Private room ${data.room.roomCode} created. Share the invite link with your friend.`);
    } catch (error) {
      setBattleError(error.response?.data?.message || 'Could not create private battle room.');
    } finally {
      setIsCreatingRoom(false);
    }
  }

  async function joinPrivateRoom(roomCode = inviteCodeInput) {
    if (!roomCode.trim()) return;
    setIsMatching(true);
    setBattleError('');

    try {
      const { data } = await api.post(`/battles/private-rooms/${roomCode.trim().toUpperCase()}/join`, {
        type: 'CODING',
      });
      setPrivateRoom(data.room);
      setBattles((current) => [data.battle, ...current.filter((battle) => battle.id !== data.battle.id)]);
      setMatchNotice(data.matchMessage);
      startBattle(data.battle);
      setIsPrivateRoomOpen(false);
    } catch (error) {
      setBattleError(error.response?.data?.message || 'Could not join private battle room.');
    } finally {
      setIsMatching(false);
    }
  }

  async function copyInviteLink() {
    if (!inviteLink) return;
    await window.navigator.clipboard.writeText(inviteLink);
    setMatchNotice('Invite link copied. Send it to your friend to join the private battle.');
  }

  async function runBattleCode() {
    setIsRunning(true);
    setBattleError('');

    try {
      const { data } = await api.post('/submissions/run', {
        problemId: activeBattle?.problemId,
        code: battleCode,
        language: battleLanguage,
        input: battleInput,
      });
      setBattleResult({ ...data, finished: false });
    } catch (error) {
      setBattleError(error.response?.data?.message || 'Run failed. Check the backend server and try again.');
    } finally {
      setIsRunning(false);
    }
  }

  async function submitBattleCode() {
    if (!activeBattle) return;
    setIsSubmitting(true);
    setBattleError('');

    try {
      const { data } = await api.post('/submissions/submit', {
        problemId: activeBattle.problemId,
        code: battleCode,
        language: battleLanguage,
      });
      const submission = data.submission;
      const accepted = submission.verdict === 'ACCEPTED';
      setBattleResult({
        ...submission,
        output: accepted ? 'Accepted. You solved it before the bot.' : data.message,
        judge: 'battle-submit',
        finished: accepted,
        winner: accepted ? 'YOU' : null,
        ratingDelta: accepted ? (activeBattle.level === 'HARD' ? 32 : activeBattle.level === 'MEDIUM' ? 24 : 16) : undefined,
      });
      if (accepted) await finishBattle('YOU', activeBattle.level === 'HARD' ? 32 : activeBattle.level === 'MEDIUM' ? 24 : 16);
    } catch (error) {
      setBattleError(error.response?.data?.message || 'Submit failed. Check the backend server and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLanguageChange(event) {
    const nextLanguage = event.target.value;
    setBattleLanguage(nextLanguage);
    setBattleCode(getStarterCode(nextLanguage, activeBattle));
    setBattleResult(null);
    setBattleError('');
  }

  useEffect(() => {
    Promise.all([loadBattles(), loadBattleHistory()]).catch(() => setBattleError('Could not load battle data. Make sure the backend is running.'));
  }, []);

  useEffect(() => {
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    let savedUser = null;

    try {
      savedUser = JSON.parse(localStorage.getItem('codearena_auth'))?.user;
    } catch {
      savedUser = null;
    }

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('presence:join', savedUser || { name: 'CodeArena Player', rating: 1200 });
    });
    socket.on('disconnect', () => setConnectionStatus('reconnecting'));
    socket.on('connect_error', () => setConnectionStatus('offline'));
    socket.emit('presence:join', savedUser || { name: 'CodeArena Player', rating: 1200 });
    socket.on('presence:update', (payload) => {
      setOnlineCount(payload.onlineCount || 1);
    });
    socket.on('battle:notification', (payload) => {
      if (payload.from !== savedUser?.name) {
        setRealtimeNotice(payload);
      }
    });
    socket.on('battle:progress', ({ battleId, progress }) => {
      if (battleId === activeBattle?.id) setBotProgress(progress);
    });

    return () => {
      if (activeBattle?.id) socket.emit('battle:leave', { battleId: activeBattle.id });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeBattle?.id]);

  useEffect(() => {
    if (activeBattle?.id && socketRef.current?.connected) {
      socketRef.current.emit('battle:join', { battleId: activeBattle.id });
    }
  }, [activeBattle?.id]);

  useEffect(() => {
    const roomCode = searchParams.get('room');

    if (roomCode) {
      joinPrivateRoom(roomCode);
    }
  }, []);

  useEffect(() => {
    if (!activeBattle || isBattleFinished) return undefined;

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeBattle, isBattleFinished]);

  useEffect(() => {
    if (!activeBattle || isBattleFinished) return undefined;

    const timer = window.setInterval(() => {
      setBotProgress((current) => Math.min(current + botStep, 100));
    }, 2600);

    return () => window.clearInterval(timer);
  }, [activeBattle, botStep, isBattleFinished]);

  useEffect(() => {
    if (!activeBattle || isBattleFinished) return;

    if (remainingSeconds === 0) {
      const delta = botProgress >= 100 ? -12 : -5;
      setBattleResult({
        verdict: 'TIME_LIMIT',
        output: 'Time is over. Review the solution and rematch when ready.',
        judge: 'battle-timer',
        finished: true,
        winner: botProgress >= 100 ? 'BOT' : null,
        ratingDelta: delta,
      });
      finishBattle(botProgress >= 100 ? 'BOT' : 'DRAW', delta);
    }
  }, [activeBattle, botProgress, isBattleFinished, remainingSeconds]);

  useEffect(() => {
    if (!activeBattle || isBattleFinished || botProgress < 100) return;

    const delta = activeBattle.level === 'HARD' ? -10 : activeBattle.level === 'MEDIUM' ? -8 : -6;
    setBattleResult({
      verdict: 'BOT_SOLVED',
      output: `${activeBattle.opponent} solved the challenge first. Your editor remains open for practice.`,
      judge: 'battle-bot',
      finished: true,
      winner: 'BOT',
      ratingDelta: delta,
    });
    finishBattle('BOT', delta);
  }, [activeBattle, botProgress, isBattleFinished]);

  useEffect(() => {
    if (battleResult?.finished) setMobileBattleTab('match');
  }, [battleResult?.finished]);

  return (
    <AppLayout
      eyebrow="Realtime 1v1"
      title="Battle Rooms"
      action={
        <div className="battle-page-actions flex flex-wrap items-center gap-3">
          <span className="battle-online-count inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            <Users size={16} />
            {onlineCount} online
          </span>
          <span className={`battle-connection-chip rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-wide ${connectionStatus === 'connected' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
            {connectionStatus === 'connected' ? 'Realtime connected' : connectionStatus === 'offline' ? 'Offline · retrying' : 'Reconnecting'}
          </span>
          <button className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50" type="button" onClick={() => setIsPrivateRoomOpen(true)}>
            <Link2 size={18} />
            Private Room
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700" type="button" onClick={() => setIsLevelOpen(true)}>
            <Swords size={18} />
            Find Battle
          </button>
        </div>
      }
    >
      {realtimeNotice && (
        <div className="fixed right-5 top-5 z-50 w-[min(360px,calc(100vw-2.5rem))] rounded-xl border border-indigo-100 bg-white p-4 text-slate-950 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Swords size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Battle notification</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{realtimeNotice.message}</p>
              {realtimeNotice.roomCode && (
                <button className="mt-3 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white" type="button" onClick={() => joinPrivateRoom(realtimeNotice.roomCode)}>
                  Join room {realtimeNotice.roomCode}
                </button>
              )}
            </div>
            <button className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50" type="button" onClick={() => setRealtimeNotice(null)} aria-label="Dismiss notification">
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {matchNotice && (
        <Panel className="mb-5 border-indigo-100 bg-indigo-50">
          <div className="flex items-center gap-3">
            <Bot className="text-indigo-600" size={22} />
            <p className="text-sm text-indigo-900">{matchNotice}</p>
          </div>
        </Panel>
      )}

      {battleError && (
        <Panel className="mb-5 border-rose-100 bg-rose-50">
          <p className="text-sm font-semibold text-rose-700">{battleError}</p>
        </Panel>
      )}

      {(privateRoom || inviteLink) && (
        <Panel className="mb-5 border-cyan-100 bg-cyan-50">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Private Battle Room</p>
              <h3 className="mt-2 text-xl font-bold text-slate-950">
                Room {privateRoom?.roomCode} · {privateRoom?.level}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {privateRoom?.participants?.length || 1} player joined. Share this invite link to start a friend battle.
              </p>
              {inviteLink && <p className="mt-3 break-all rounded-md border border-cyan-100 bg-white px-3 py-2 text-sm text-slate-700">{inviteLink}</p>}
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <button className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700" type="button" onClick={copyInviteLink}>
                <Copy size={17} />
                Copy Invite
              </button>
              <button className="rounded-md border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50" type="button" onClick={() => joinPrivateRoom(privateRoom?.roomCode)}>
                Open Room
              </button>
            </div>
          </div>
        </Panel>
      )}

      {activeBattle && (
        <Panel className="battle-active-panel mb-6 overflow-hidden border-indigo-100">
          <div className="battle-mobile-tabs" role="tablist" aria-label="Battle panels">
            <button type="button" role="tab" aria-selected={mobileBattleTab === 'code'} onClick={() => setMobileBattleTab('code')}>Code</button>
            <button type="button" role="tab" aria-selected={mobileBattleTab === 'match'} onClick={() => setMobileBattleTab('match')}>Match</button>
          </div>
          <div className="battle-workspace">
            <div className={`battle-editor-column${mobileBattleTab === 'match' ? ' battle-panel-mobile-hidden' : ''}`}>
              <div className="battle-active-heading flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Live Competition</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-950">{activeBattle.problemTitle}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Matched with {activeBattle.opponent} at {activeBattle.level} level.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Clock size={16} />
                    Battle Timer
                  </div>
                  <p className={`mt-1 font-mono text-3xl font-bold ${remainingSeconds <= 60 ? 'text-rose-600' : 'text-slate-950'}`}>
                    {formatTimer(remainingSeconds)}
                  </p>
                </div>
              </div>

              <div className="battle-editor-frame mt-5 overflow-hidden rounded-lg border border-slate-200">
                <Editor
                  height="clamp(300px, 56vh, 520px)"
                  language={battleLanguage === 'cpp' ? 'cpp' : battleLanguage}
                  theme="vs-dark"
                  value={battleCode}
                  onChange={(value) => setBattleCode(value || '')}
                  options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
                />
              </div>

              <div className="battle-input-controls mt-4 grid gap-4 lg:grid-cols-[1fr_180px_180px]">
                <textarea
                  className="min-h-28 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-indigo-300"
                  value={battleInput}
                  onChange={(event) => setBattleInput(event.target.value)}
                  placeholder="Custom input for this battle"
                />
                <div className="battle-action-group grid gap-3">
                  <select
                    className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800"
                    value={battleLanguage}
                    onChange={handleLanguageChange}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                  <button className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={runBattleCode} disabled={isRunning || isSubmitting}>
                    <Play size={18} />
                    {isRunning ? 'Running...' : 'Run'}
                  </button>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={submitBattleCode} disabled={isRunning || isSubmitting || isBattleFinished}>
                  <Send size={18} />
                  {isSubmitting ? 'Submitting...' : 'Submit Battle'}
                </button>
              </div>
            </div>

            <div className={`battle-match-column grid content-start gap-4${mobileBattleTab === 'code' ? ' battle-panel-mobile-hidden' : ''}`}>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Your Progress</p>
                    <p className="text-xs text-slate-500">Submit accepted code to win.</p>
                  </div>
                  <Trophy size={20} className={battleResult?.winner === 'YOU' ? 'text-emerald-600' : 'text-slate-400'} />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${battleResult?.winner === 'YOU' ? 100 : 42}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{activeBattle.opponent}</p>
                    <p className="text-xs text-slate-500">
                      Rating {activeBattle.opponentRating} · {activeBattle.botStyle}
                    </p>
                  </div>
                  <Bot size={21} className={battleResult?.winner === 'BOT' ? 'text-rose-600' : 'text-indigo-600'} />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${botProgress}%` }} />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">Bot progress {botProgress}%</p>
              </div>

              {battleResult && (
                <div className={`rounded-xl border p-4 ${battleResult.winner === 'YOU' ? 'border-emerald-200 bg-emerald-50' : battleResult.winner === 'BOT' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}>
                  <p className="font-semibold text-slate-950">{battleResult.verdict}</p>
                  <p className="mt-2 text-sm text-slate-600">{battleResult.output || battleResult.stderr}</p>
                  {battleResult.ratingDelta !== undefined && (
                    <p className={`mt-3 text-sm font-bold ${battleResult.ratingDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      Rating {battleResult.ratingDelta >= 0 ? '+' : ''}{battleResult.ratingDelta}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-slate-500">
                    Runtime {battleResult.runtimeMs || '-'}ms · Memory {battleResult.memoryKb || '-'}KB · {battleResult.judge}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Panel>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {battles.map((battle) => (
          <Panel key={battle.id}>
            <div className="flex items-center justify-between">
              <span className="rounded bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {battle.status}
              </span>
              <span className="text-sm text-slate-500">{battle.timeLeft} · {battle.level || 'MEDIUM'}</span>
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-950">{battle.problemTitle}</h3>
            <p className="mt-2 text-slate-600">
              Opponent: {battle.opponent} {battle.opponentType === 'BOT' ? '(Bot)' : ''}
            </p>
            {battle.opponentRating && (
              <p className="mt-1 text-sm text-slate-500">Rating {battle.opponentRating} · {battle.botStyle}</p>
            )}
            <div className="mt-5 h-2 rounded bg-slate-100">
              <div className="h-2 rounded bg-indigo-600" style={{ width: `${battle.progress}%` }} />
            </div>
            <button className="mt-5 w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50" type="button" onClick={() => startBattle(battle)}>
              Open Battle
            </button>
          </Panel>
        ))}
      </div>

      <Panel className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Proof of progress</p>
            <h3 className="mt-1 text-xl font-bold text-slate-950">Battle history</h3>
          </div>
          <span className="text-sm text-slate-500">{battleHistory.length} recorded results</span>
        </div>
        {battleHistory.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-slate-200 p-5 text-sm text-slate-500">Finish a battle to build your competitive history.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {battleHistory.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold uppercase ${item.result === 'WIN' ? 'text-emerald-700' : item.result === 'LOSS' ? 'text-rose-700' : 'text-slate-600'}`}>{item.result}</span>
                  <span className="text-xs text-slate-500">{item.level}</span>
                </div>
                <p className="mt-2 font-semibold text-slate-950">{item.problemTitle}</p>
                <p className="mt-1 text-sm text-slate-600">vs {item.opponent} · {item.ratingDelta >= 0 ? '+' : ''}{item.ratingDelta} rating</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {isLevelOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-950 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Choose Battle Level</p>
                <h3 className="mt-2 text-2xl font-bold">Before matching, select your level.</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  If no live player is available, CodeArena immediately starts a timed bot match at the same level.
                </p>
              </div>
              <button className="rounded border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" type="button" onClick={() => setIsLevelOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {levelOptions.map((option) => (
                <button
                  key={option.level}
                  className={`rounded border p-4 text-left transition ${
                    selectedLevel === option.level
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  type="button"
                  onClick={() => setSelectedLevel(option.level)}
                >
                  <p className="font-semibold">{option.level} · {option.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{option.copy}</p>
                </button>
              ))}
            </div>

            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={() => findBattle(selectedLevel)} disabled={isMatching}>
              <Swords size={18} />
              {isMatching ? 'Matching...' : `Start ${selectedLevel} Battle`}
            </button>
          </div>
        </div>
      )}

      {isPrivateRoomOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-slate-950 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Private Battle</p>
                <h3 className="mt-2 text-2xl font-bold">Invite a friend or join by code.</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Create a room link like online chess apps, share it, and your friend can join the same battle room.
                </p>
              </div>
              <button className="rounded border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" type="button" onClick={() => setIsPrivateRoomOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="grid grid-cols-3 gap-2">
                {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                  <button
                    key={level}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold ${selectedLevel === level ? 'border-indigo-200 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                    type="button"
                    onClick={() => setSelectedLevel(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={createPrivateRoom} disabled={isCreatingRoom}>
                <Link2 size={18} />
                {isCreatingRoom ? 'Creating...' : 'Create Invite Link'}
              </button>

              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-300"
                  value={inviteCodeInput}
                  onChange={(event) => setInviteCodeInput(event.target.value.toUpperCase())}
                  placeholder="Enter room code"
                />
                <button className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60" type="button" onClick={() => joinPrivateRoom()} disabled={!inviteCodeInput.trim() || isMatching}>
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default BattlesPage;
