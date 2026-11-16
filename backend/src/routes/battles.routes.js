import { Router } from 'express';
import { demoStore, createId, persistBattles, persistUsers } from '../data/demo-store.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

const botPool = {
  EASY: [
    { name: 'CodeArena Rookie Bot', rating: 920, style: 'Practices arrays and string basics', progress: 18 },
    { name: 'CodeArena Warmup Bot', rating: 980, style: 'Solves slowly but accurately', progress: 24 },
  ],
  MEDIUM: [
    { name: 'CodeArena Interview Bot', rating: 1280, style: 'Strong with binary search and stacks', progress: 38 },
    { name: 'CodeArena Match Bot', rating: 1340, style: 'Balanced DSA competitor', progress: 44 },
  ],
  HARD: [
    { name: 'CodeArena Expert Bot', rating: 1680, style: 'Fast on graph and DP problems', progress: 52 },
    { name: 'CodeArena Final Round Bot', rating: 1820, style: 'Aggressive hard-problem strategy', progress: 58 },
  ],
};

const levelTiming = {
  EASY: { durationSeconds: 900, botTargetSeconds: 780 },
  MEDIUM: { durationSeconds: 1200, botTargetSeconds: 930 },
  HARD: { durationSeconds: 1500, botTargetSeconds: 1120 },
};

function pickProblem(level) {
  const candidates = demoStore.problems.filter((problem) => problem.difficulty === level);
  return candidates[Math.floor(Math.random() * candidates.length)] || demoStore.problems[0];
}

function createBattlePayload({ req, level, problem, opponent, opponentType, opponentRating, botStyle, roomCode, progress = 0 }) {
  const timing = levelTiming[level] || levelTiming.MEDIUM;

  return {
    id: createId('battle'),
    userId: req.user.id,
    type: req.body.type || 'CODING',
    status: 'ACTIVE',
    level,
    problemId: problem.id,
    problemSlug: problem.slug,
    problemTitle: problem.title,
    opponent,
    opponentType,
    opponentRating,
    botStyle,
    roomCode,
    startedAt: new Date().toISOString(),
    durationSeconds: timing.durationSeconds,
    botTargetSeconds: timing.botTargetSeconds,
    timeLeft: `${Math.floor(timing.durationSeconds / 60)}:00`,
    progress: opponentType === 'BOT' ? progress : 0,
  };
}

function createRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

router.get('/', authenticate, (_req, res) => {
  res.status(200).json({ battles: demoStore.battles });
});

router.get('/history', authenticate, (req, res) => {
  const history = demoStore.battles
    .filter((battle) => battle.userId === req.user.id && battle.status === 'COMPLETED')
    .slice(0, 30)
    .map((battle) => ({
      id: battle.id,
      level: battle.level,
      opponent: battle.opponent,
      opponentType: battle.opponentType,
      problemTitle: battle.problemTitle,
      result: battle.result || 'PENDING',
      ratingDelta: battle.ratingDelta || 0,
      finishedAt: battle.finishedAt,
    }));
  res.status(200).json({ history });
});

router.post('/matchmake', authenticate, (req, res) => {
  const level = req.body.level || 'MEDIUM';
  const problem = pickProblem(level);
  const bots = botPool[level] || botPool.MEDIUM;
  const bot = bots[Math.floor(Math.random() * bots.length)];
  const io = req.app.get('io');
  const onlineUsers = req.app.get('onlineUsers');
  const onlinePlayers = onlineUsers ? Array.from(onlineUsers.values()) : [];
  const availableHuman = onlinePlayers.find((player) => player.id !== req.user.id);
  const battle = createBattlePayload({
    req,
    level,
    problem,
    opponent: availableHuman?.name || bot.name,
    opponentType: availableHuman ? 'PLAYER' : 'BOT',
    opponentRating: availableHuman?.rating || bot.rating,
    botStyle: availableHuman ? 'Live online challenger' : bot.style,
    progress: bot.progress,
  });

  battle.matchMessage = availableHuman
    ? `${availableHuman.name} is online, so CodeArena started a live ${level.toLowerCase()} battle.`
    : `No live ${level.toLowerCase()} player was waiting, so CodeArena matched you with a same-level bot.`;

  if (io) {
    io.to('online-players').emit('battle:notification', {
      type: 'MATCHMAKING',
      from: req.user.name,
      level,
      problemTitle: problem.title,
      message: `${req.user.name} is searching for a ${level} battle.`,
    });
  }

  demoStore.battles.unshift(battle);
  persistBattles();
  res.status(201).json({ battle });
});

router.post('/private-rooms', authenticate, (req, res) => {
  const level = req.body.level || 'MEDIUM';
  const problem = pickProblem(level);
  const roomCode = createRoomCode();
  const room = {
    id: createId('room'),
    roomCode,
    hostId: req.user.id,
    hostName: req.user.name,
    level,
    status: 'WAITING',
    problemId: problem.id,
    problemTitle: problem.title,
    createdAt: new Date().toISOString(),
    participants: [{ id: req.user.id, name: req.user.name, rating: req.user.rating || 1200 }],
  };

  demoStore.privateRooms.unshift(room);

  const inviteLink = `${req.body.origin || 'http://127.0.0.1:5173'}/battles?room=${roomCode}`;
  const io = req.app.get('io');
  if (io) {
    io.to('online-players').emit('battle:notification', {
      type: 'PRIVATE_ROOM',
      from: req.user.name,
      level,
      roomCode,
      inviteLink,
      message: `${req.user.name} created a ${level} private battle room.`,
    });
  }

  res.status(201).json({ room, inviteLink });
});

router.post('/private-rooms/:roomCode/join', authenticate, (req, res) => {
  const room = demoStore.privateRooms.find((item) => item.roomCode === req.params.roomCode.toUpperCase());

  if (!room) {
    res.status(404).json({ message: 'Private battle room not found.' });
    return;
  }

  if (!room.participants.some((participant) => participant.id === req.user.id)) {
    room.participants.push({ id: req.user.id, name: req.user.name, rating: req.user.rating || 1200 });
  }

  const problem = demoStore.problems.find((item) => item.id === room.problemId) || pickProblem(room.level);
  const battle = createBattlePayload({
    req,
    level: room.level,
    problem,
    opponent: room.hostId === req.user.id ? 'Waiting for invited player' : room.hostName,
    opponentType: room.participants.length > 1 ? 'PLAYER' : 'PRIVATE_ROOM',
    opponentRating: room.participants[0]?.rating || 1200,
    botStyle: room.participants.length > 1 ? 'Private room challenger' : 'Share invite link to start with a friend',
    roomCode: room.roomCode,
  });

  room.status = room.participants.length > 1 ? 'ACTIVE' : 'WAITING';
  demoStore.battles.unshift(battle);
  persistBattles();

  const io = req.app.get('io');
  if (io) {
    io.to('online-players').emit('battle:notification', {
      type: 'PRIVATE_ROOM_JOINED',
      from: req.user.name,
      level: room.level,
      roomCode: room.roomCode,
      message: `${req.user.name} joined private room ${room.roomCode}.`,
    });
  }

  res.status(200).json({
    room,
    battle,
    matchMessage: room.status === 'ACTIVE'
      ? `Private room ${room.roomCode} is active.`
      : `Private room ${room.roomCode} is waiting for your friend to join.`,
  });
});

router.post('/:battleId/finish', authenticate, (req, res) => {
  const battle = demoStore.battles.find((item) => item.id === req.params.battleId && item.userId === req.user.id);

  if (!battle) {
    res.status(404).json({ message: 'Battle not found for this player.' });
    return;
  }

  if (battle.status === 'COMPLETED') {
    res.status(200).json({ battle });
    return;
  }

  const result = ['YOU', 'BOT', 'DRAW'].includes(req.body.result) ? req.body.result : 'DRAW';
  const ratingDelta = Number.isFinite(Number(req.body.ratingDelta)) ? Number(req.body.ratingDelta) : 0;
  battle.status = 'COMPLETED';
  battle.result = result === 'YOU' ? 'WIN' : result === 'BOT' ? 'LOSS' : 'DRAW';
  battle.ratingDelta = ratingDelta;
  battle.finishedAt = new Date().toISOString();

  const user = demoStore.users.find((item) => item.id === req.user.id);
  if (user) {
    user.rating = Math.max(0, (user.rating || 1000) + ratingDelta);
    if (battle.result === 'WIN') user.wins = (user.wins || 0) + 1;
    if (battle.result === 'LOSS') user.losses = (user.losses || 0) + 1;
    persistUsers();
  }
  persistBattles();

  const io = req.app.get('io');
  io?.to(`battle:${battle.id}`).emit('battle:finished', { battle });
  res.status(200).json({ battle });
});

export default router;
