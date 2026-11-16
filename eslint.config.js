import js from '@eslint/js';

const sharedGlobals = {
  console: 'readonly',
  process: 'readonly',
  setTimeout: 'readonly',
};

const browserGlobals = {
  document: 'readonly',
  localStorage: 'readonly',
  window: 'readonly',
};

export default [
  {
    ignores: ['node_modules/**', 'frontend/dist/**', 'backend/generated/**'],
  },
  js.configs.recommended,
  {
    files: ['backend/src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: sharedGlobals,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['frontend/src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...sharedGlobals,
        ...browserGlobals,
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
];
