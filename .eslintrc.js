module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-constant-condition': 'warn',
    'no-prototype-builtins': 'off',
    'no-useless-catch': 'warn',
    'prefer-const': 'warn'
  },
  ignorePatterns: ['node_modules', 'dist', 'build', 'coverage']
};