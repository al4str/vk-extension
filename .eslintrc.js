module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  globals: {
    chrome: true,
  },
  env: {
    es6: true,
    browser: true,
  },
  extends: [
    'eslint-config-airbnb-base',
  ],
  plugins: [
    'svelte3',
  ],
  rules: {
    'arrow-body-style': 'off',
    'arrow-parens': [
      'error',
      'always',
    ],
    'brace-style': [
      'error',
      'stroustrup',
    ],
    'camelcase': [
      'off',
      {
        'properties': 'always',
      },
    ],
    'consistent-return': ['warn'],
    'func-names': [
      'error',
      'never',
    ],
    'function-paren-newline': [
      'error',
      'consistent',
    ],
    'import/no-extraneous-dependencies': 'off',
    'import/no-named-as-default': 'off',
    'import/no-unresolved': [
      'error',
      {
        'ignore': [
          '^@',
        ],
      },
    ],
    'import/prefer-default-export': 'off',
    'lines-between-class-members': 'off',
    'linebreak-style': [
      'error',
      'unix',
    ],
    'max-len': 'off',
    'no-console': [
      'warn',
      {
        'allow': [
          'warn',
          'error',
        ],
      },
    ],
    'no-extend-native': 'error',
    'no-global-assign': 'error',
    'no-param-reassign': [
      'error',
      {
        'props': false,
      },
    ],
    'no-underscore-dangle': 'off',
    'no-use-before-define': [
      'error',
      {
        'functions': false,
        'classes': false,
      },
    ],
    'object-curly-newline': 'off',
    'operator-linebreak': [
      'error',
      'before',
    ],
    'prefer-destructuring': 'off',
    'radix': 'off',
    'space-before-function-paren': [
      'error',
      {
        'anonymous': 'never',
        'named': 'never',
        'asyncArrow': 'always',
      },
    ],
    'spaced-comment': 'off',
    'quote-props': ['error', 'consistent-as-needed'],
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack/webpack.config.base.js',
      },
    },
  },
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
};
