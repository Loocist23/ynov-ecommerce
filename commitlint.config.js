module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 500],
    'subject-max-length': [2, 'always', 500]
  }
};
