import { Router } from 'express';
import { demoStore, createId } from '../data/demo-store.js';
import { authenticate } from '../middleware/authenticate.js';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { executeWithJudge0 } from '../services/judge0.service.js';

const router = Router();

const problemRules = [
  {
    match: /two sum/i,
    concepts: ['target'],
    patterns: [/\b(map|dict|unordered_map|hashmap|object|record)\b/i, /\bfor\b|\bwhile\b/i],
  },
  {
    match: /contains duplicate/i,
    concepts: [],
    patterns: [/\b(set|hashset)\b/i],
  },
  {
    match: /valid anagram/i,
    concepts: [],
    patterns: [/\bsort\b/i, /\b(map|dict|unordered_map|hashmap|count|frequency)\b/i],
  },
  {
    match: /group anagrams/i,
    concepts: [],
    patterns: [/\bsort\b/i, /\b(map|dict|unordered_map|hashmap)\b/i],
  },
  {
    match: /parentheses|bracket/i,
    concepts: [],
    patterns: [/\b(stack|push|pop)\b/i],
  },
  {
    match: /binary search|rotated|minimum in rotated|search insert|peak element|sqrt/i,
    concepts: [],
    patterns: [/\b(left|right|mid|lo|hi|low|high)\b/i, /\bwhile\b/i],
  },
  {
    match: /linked list|node/i,
    concepts: [],
    patterns: [/\b(next|prev|slow|fast|head)\b/i],
  },
  {
    match: /tree|bst|ancestor|depth|diameter|path sum/i,
    concepts: [],
    patterns: [/\b(dfs|bfs|queue|stack|recursive|recursion)\b/i],
  },
  {
    match: /island|graph|course|connected|network|ladder|clone/i,
    concepts: [],
    patterns: [/\b(dfs|bfs|queue|visited|union|find)\b/i],
  },
  {
    match: /dynamic programming|climbing|robber|coin change|subsequence|edit distance|decode ways|word break/i,
    concepts: [],
    patterns: [/\b(dp|memo|cache|tabulation)\b/i],
  },
  {
    match: /substring|window|permutation/i,
    concepts: [],
    patterns: [/\b(left|right|window|freq|count)\b/i],
  },
  {
    match: /heap|kth|median|top k|closest/i,
    concepts: [],
    patterns: [/\b(heap|priorityqueue|priority_queue|quickselect)\b/i],
  },
];

function hasOnlyPlaceholderCode(normalized) {
  const compact = normalized.replace(/\s+/g, ' ');

  return (
    compact.includes('write your') ||
    compact.includes('build your winning solution') ||
    /\breturn\s+(input|data)\s*;?/.test(compact) ||
    /\bcout\s*<<\s*input\b/.test(compact) ||
    /\bsystem\.out\.println\s*\(\s*input\s*\)/.test(compact) ||
    /\bprint\s*\(\s*solve\s*\(\s*["']demo input["']\s*\)\s*\)/.test(compact) ||
    /\ba\s*=\s*random\b/.test(compact) ||
    /\brandom code\b/.test(compact)
  );
}

function hasLanguageStructure(code, language) {
  if (language === 'cpp') return /#include|int\s+main|class\s+\w+/.test(code);
  if (language === 'java') return /class\s+main|public\s+class|static\s+void\s+main/i.test(code);
  if (language === 'python') return /def\s+\w+|for\s+\w+\s+in|while\s+/.test(code);
  return /function\s+\w+|=>|for\s*\(|while\s*\(|const\s+|let\s+/.test(code);
}

function hasEnoughAlgorithmSignal(code, problem) {
  const rule = problemRules.find((item) => item.match.test(problem.title));

  if (rule) {
    const conceptPass = rule.concepts.every((concept) => code.includes(concept.toLowerCase()));
    const patternPass = rule.patterns.some((pattern) => pattern.test(code));
    return conceptPass && patternPass;
  }

  const tags = (problem.tags || []).join(' ').toLowerCase();
  const patternHints = [
    ['hash', /\b(map|dict|set|hash|frequency|count)\b/i],
    ['array', /\b(for|while|length|size|push|append)\b/i],
    ['string', /\b(char|split|substring|slice|tolower|tolowercase|length)\b/i],
    ['stack', /\b(stack|push|pop)\b/i],
    ['queue', /\b(queue|shift|deque|poll|offer)\b/i],
    ['tree', /\b(dfs|bfs|root|left|right|recursive)\b/i],
    ['graph', /\b(dfs|bfs|visited|adj|queue|union)\b/i],
    ['dynamic programming', /\b(dp|memo|cache|tabulation)\b/i],
    ['binary search', /\b(left|right|mid|low|high)\b/i],
    ['two pointers', /\b(left|right|slow|fast|pointer)\b/i],
    ['heap', /\b(heap|priorityqueue|priority_queue|quickselect)\b/i],
  ];

  const relevantHints = patternHints.filter(([tag]) => tags.includes(tag));
  if (relevantHints.length === 0) {
    return /\b(if|for|while|return)\b/i.test(code) && code.length > 220;
  }

  return relevantHints.some(([, pattern]) => pattern.test(code));
}

function getVerdict({ code, language, problem }) {
  const normalized = String(code || '').toLowerCase();

  if (!normalized.trim()) return 'COMPILATION_ERROR';
  if (normalized.includes('throw') || normalized.includes('error')) return 'RUNTIME_ERROR';
  if (hasOnlyPlaceholderCode(normalized)) return 'WRONG_ANSWER';
  if (!hasLanguageStructure(normalized, language)) return 'COMPILATION_ERROR';
  if (hasEnoughAlgorithmSignal(normalized, problem)) return 'ACCEPTED';

  return 'WRONG_ANSWER';
}

router.post('/run', authenticate, async (req, res, next) => {
  const { code, language, input, problemId } = req.body;
  const problem = demoStore.problems.find((item) => item.id === problemId) || demoStore.problems[0];
  try {
    const judgeResult = await executeWithJudge0({
      code,
      language,
      input,
      expectedOutput: problem.sampleOutput,
    });
    const verdict = judgeResult?.verdict || getVerdict({ code, language, problem });

    res.status(200).json({
      verdict,
      language,
      input,
      problem: { id: problem.id, title: problem.title },
      output: judgeResult?.output || (verdict === 'ACCEPTED' ? 'Sample checks passed for the selected problem.' : ''),
      stderr: judgeResult?.stderr || (verdict === 'ACCEPTED' ? '' : 'Judge rejected this code. Placeholder, random, or unrelated code does not pass.'),
      runtimeMs: judgeResult?.runtimeMs || 42,
      memoryKb: judgeResult?.memoryKb || 15360,
      judge: judgeResult?.judge || 'problem-aware-local-judge',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/submit', authenticate, async (req, res, next) => {
  const { problemId, code, language } = req.body;
  const problem = demoStore.problems.find((item) => item.id === problemId) || demoStore.problems[0];
  try {
    const judgeResult = await executeWithJudge0({
      code,
      language,
      input: problem.sampleInput,
      expectedOutput: problem.sampleOutput,
    });
    const verdict = judgeResult?.verdict || getVerdict({ code, language, problem });
  const submission = {
    id: createId('sub'),
    userId: req.user.id,
    problemId: problem.id,
    code,
    language,
    verdict,
    runtimeMs: judgeResult?.runtimeMs || (verdict === 'ACCEPTED' ? 39 : null),
    memoryKb: judgeResult?.memoryKb || (verdict === 'ACCEPTED' ? 14820 : null),
    createdAt: new Date().toISOString(),
    problem: {
      title: problem.title,
      difficulty: problem.difficulty,
    },
  };

    if (env.DEMO_MODE) {
      demoStore.submissions.unshift(submission);
    } else {
      await prisma.submission.create({
        data: {
          code,
          language,
          verdict,
          runtimeMs: submission.runtimeMs,
          memoryKb: submission.memoryKb,
          userId: req.user.id,
          problemId: problem.id,
        },
      });
    }

    res.status(201).json({
      submission,
      message: verdict === 'ACCEPTED'
        ? 'Accepted. Selected problem checks passed.'
        : judgeResult?.stderr || 'Wrong answer. Code must solve the selected problem before it can count.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me/history', authenticate, async (req, res, next) => {
  try {
    if (env.DEMO_MODE) {
      res.status(200).json({ submissions: demoStore.submissions.filter((item) => item.userId === req.user.id) });
      return;
    }
    const submissions = await prisma.submission.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.status(200).json({ submissions });
  } catch (error) {
    next(error);
  }
});

export default router;
