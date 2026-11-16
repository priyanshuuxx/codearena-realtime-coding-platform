import axios from 'axios';
import { env } from '../config/env.js';

const languageIds = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
};

const statusMap = {
  3: 'ACCEPTED',
  4: 'WRONG_ANSWER',
  5: 'TIME_LIMIT_EXCEEDED',
  6: 'COMPILATION_ERROR',
  7: 'RUNTIME_ERROR',
  8: 'RUNTIME_ERROR',
  9: 'RUNTIME_ERROR',
  10: 'RUNTIME_ERROR',
  11: 'RUNTIME_ERROR',
  12: 'RUNTIME_ERROR',
  13: 'RUNTIME_ERROR',
  14: 'RUNTIME_ERROR',
  15: 'RUNTIME_ERROR',
  16: 'RUNTIME_ERROR',
};

function judge0Headers() {
  return {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': env.JUDGE0_API_KEY,
    'X-RapidAPI-Host': new globalThis.URL(env.JUDGE0_API_URL).host,
  };
}

function isJudge0Configured() {
  return Boolean(env.JUDGE0_API_KEY && env.JUDGE0_API_URL);
}

async function pollSubmission(token) {
  const url = `${env.JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`;

  for (let attempt = 0; attempt < 15; attempt += 1) {
    const { data } = await axios.get(url, { headers: judge0Headers(), timeout: 8000 });
    if (data.status?.id >= 3) {
      return data;
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  return {
    status: { id: 5, description: 'Time Limit Exceeded' },
    stderr: 'Judge0 did not finish within the platform timeout.',
  };
}

export async function executeWithJudge0({ code, language, input, expectedOutput }) {
  if (!isJudge0Configured()) return null;

  const languageId = languageIds[language];
  if (!languageId) {
    return {
      verdict: 'COMPILATION_ERROR',
      stderr: `Unsupported language: ${language}`,
      judge: 'judge0',
    };
  }

  try {
    const { data } = await axios.post(
      `${env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`,
      {
        source_code: code,
        language_id: languageId,
        stdin: input || '',
        expected_output: expectedOutput || undefined,
      },
      { headers: judge0Headers(), timeout: 10000 },
    );
    const result = await pollSubmission(data.token);

    return {
      verdict: statusMap[result.status?.id] || 'RUNTIME_ERROR',
      output: result.stdout || '',
      stderr: result.stderr || result.compile_output || '',
      runtimeMs: result.time ? Math.round(Number(result.time) * 1000) : null,
      memoryKb: result.memory || null,
      judge: 'judge0',
    };
  } catch (error) {
    return {
      verdict: 'JUDGE_ERROR',
      output: '',
      stderr: error.response?.data?.message || 'Judge0 is unavailable. Try again or use demo mode.',
      judge: 'judge0',
    };
  }
}
