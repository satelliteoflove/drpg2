import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
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
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        setInterval: 'readonly',
        crypto: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',
      
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
      'no-magic-numbers': ['warn', { 
        ignore: [-1, 0, 1, 2, 3, 6, 8, 10, 11, 12, 15, 16, 20, 25, 32, 36, 60, 100, 200, 1000, 3600],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true 
      }],
      
      // Performance considerations
      'no-loop-func': 'error',
      
      // Error prevention
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      
      // Code organization
      'sort-imports': ['error', {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      }],
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.js',
      '*.d.ts',
    ],
  },
];