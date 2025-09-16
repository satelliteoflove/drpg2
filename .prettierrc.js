module.exports = {
  // Formatting options
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',

  // TypeScript specific
  parser: 'typescript',

  // Game development preferences
  endOfLine: 'lf',
  insertPragma: false,
  requirePragma: false,
  proseWrap: 'preserve',

  // File type overrides
  overrides: [
    {
      files: '*.json',
      options: {
        parser: 'json',
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'always',
        printWidth: 80,
      },
    },
  ],
};
