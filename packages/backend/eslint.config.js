import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    ignores: ['node_modules', 'coverage', 'dist', '.vs', 'scratch', 'docs'],
  },
  {
    files: ['src/**/*.js', 'test/**/*.js', 'scripts/**/*.js', 'jest.setup.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  eslintConfigPrettier,
];
