module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:vue/essential',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    parser: 'babel-eslint',
  },
  plugins: [
    'vue', 'html',
  ],
  rules: {
    camelcase: 0,
    'linebreak-style': 0,
    'no-console': 0,
    'no-plusplus': 0,
    'no-restricted-syntax': 1,
    'no-continue': 0,
    'no-unused-vars': 1,
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
  },
};
