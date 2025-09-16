import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

// Browser globals
const browserGlobals = {
  console: 'readonly',
  document: 'readonly',
  window: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  performance: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  crypto: 'readonly',
  btoa: 'readonly',
  atob: 'readonly',
  HTMLCanvasElement: 'readonly',
  CanvasRenderingContext2D: 'readonly',
  Image: 'readonly',
  ImageData: 'readonly',
  Event: 'readonly',
  KeyboardEvent: 'readonly',
  MouseEvent: 'readonly',
  Element: 'readonly',
  HTMLElement: 'readonly',
  HTMLInputElement: 'readonly',
  HTMLButtonElement: 'readonly',
  HTMLDivElement: 'readonly',
  HTMLSpanElement: 'readonly',
  DOMRect: 'readonly',
};

// Node.js globals
const nodeGlobals = {
  require: 'readonly',
  module: 'readonly',
  exports: 'readonly',
  global: 'readonly',
  process: 'readonly',
  Buffer: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
};

// Jest globals
const jestGlobals = {
  jest: 'readonly',
  expect: 'readonly',
  test: 'readonly',
  describe: 'readonly',
  beforeEach: 'readonly',
  beforeAll: 'readonly',
  afterEach: 'readonly',
  afterAll: 'readonly',
  it: 'readonly',
};

export default [
  js.configs.recommended,
  // TypeScript source files
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...browserGlobals,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': ['error', { endOfLine: 'lf' }],

      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // General code quality
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-expressions': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-vars': 'off', // Use TypeScript version instead

      // Game development specific
      'no-magic-numbers': [
        'warn',
        {
          ignore: [
            -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 20, 24, 25, 30, 32, 36, 40, 50,
            60, 80, 100, 200, 256, 268, 400, 500, 600, 624, 1000, 1800, 3600,
          ],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
        },
      ],

      // Performance considerations
      'no-loop-func': 'error',

      // Error prevention
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // Code organization
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],
    },
  },
  // Test files (TypeScript)
  {
    files: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/__tests__/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
        ...jestGlobals,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': ['error', { endOfLine: 'lf' }],
      '@typescript-eslint/no-explicit-any': 'off', // More lenient in tests
      '@typescript-eslint/explicit-function-return-type': 'off', // Not needed in tests
      'no-magic-numbers': 'off', // Tests often use arbitrary numbers
    },
  },
  // JavaScript test files (Playwright)
  {
    files: ['tests/**/*.js', 'tests/**/*.test.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': ['error', { endOfLine: 'lf' }],
      'no-console': 'off', // Tests can use console
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-magic-numbers': 'off', // Tests often use arbitrary numbers
    },
  },
  // Configuration files
  {
    files: ['*.js', '*.config.js', '*.config.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...nodeGlobals,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': ['error', { endOfLine: 'lf' }],
      'no-console': 'off', // Config files can use console
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.d.ts', 'coverage/', 'test-results/'],
  },
];
