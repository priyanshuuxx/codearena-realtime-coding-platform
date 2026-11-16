import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { debugChallenges, problems } from './problem-catalog.js';
import { mcqQuestions } from './mcq-catalog.js';

const now = new Date().toISOString();

const defaultUsers = [
  {
    id: 'user_demo',
    name: 'Demo Coder',
    email: 'demo@codearena.dev',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'USER',
    rating: 1240,
    wins: 8,
    losses: 3,
    mcqScore: 140,
    debuggingScore: 88,
    createdAt: now,
  },
];

const usersFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'users.json');
const battlesFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'battles.json');

function loadUsers() {
  try {
    const savedUsers = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    return Array.isArray(savedUsers) && savedUsers.length > 0 ? savedUsers : defaultUsers;
  } catch {
    return defaultUsers;
  }
}

export function persistUsers() {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

const users = loadUsers();

const defaultBattles = [
  {
    id: 'battle_live_demo',
    type: 'CODING',
    status: 'ACTIVE',
    problemTitle: 'Valid Parentheses',
    opponent: 'Aarav',
    timeLeft: '14:22',
    progress: 62,
  },
];

function loadBattles() {
  try {
    const savedBattles = JSON.parse(fs.readFileSync(battlesFile, 'utf8'));
    return Array.isArray(savedBattles) && savedBattles.length > 0 ? savedBattles : defaultBattles;
  } catch {
    return defaultBattles;
  }
}

export function persistBattles() {
  fs.writeFileSync(battlesFile, JSON.stringify(battles, null, 2));
}

const submissions = [];
const mcqAttempts = [];
const debugAttempts = [];
const privateRooms = [];
const notifications = [];
const battles = loadBattles();

export const demoStore = {
  users,
  problems,
  debugChallenges,
  mcqQuestions,
  submissions,
  mcqAttempts,
  debugAttempts,
  battles,
  privateRooms,
  notifications,
};

export function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
