module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: "./tsconfig.dev.json",
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    "standard-with-typescript",
  ],
};

