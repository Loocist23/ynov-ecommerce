import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly'
      },
      ecmaVersion: 'latest',
      sourceType: 'commonjs'
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'error'
    }
  }
];