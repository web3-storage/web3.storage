module.exports = {
  extends: [
    'react-app',
    'next',
    'next/core-web-vitals',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jsx-a11y/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:cypress/recommended',
  ],
  env: {
    browser: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 9, // Allows for the parsing of modern ECMAScript features
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module', // Allows for the use of imports
  },
  plugins: ['jsx-a11y', 'prettier', '@typescript-eslint', 'cypress'],
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'lib', 'pages', 'components', 'content', 'hooks', 'modules'],
        paths: ['.'],
      },
      alias: [
        ['ZeroComponents', './modules/zero/components'],
        ['ZeroHooks', './modules/zero/hooks'],
      ],
    },
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    '@typescript-eslint/no-inferrable-types': 2,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-empty-interface': 2,
    '@typescript-eslint/no-var-requires': 2,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-redeclare': 0,
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-unnecessary-waiting': 'error',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/no-force': 'warn',
    'cypress/no-async-tests': 'error',
    'jsx-a11y/no-autofocus': 0,
    'jsx-a11y/mouse-events-have-key-events': 0,
    'import/no-anonymous-default-export': 0,
    'import/no-named-as-default': 2,
    'import/no-named-as-default-member': 0,
    'import/no-duplicates': 2,
    'import/prefer-default-export': 0,
    'import/default': 2,
    'import/export': 2,
    'import/namespace': 2,
    'import/no-unresolved': 2,
    'import/order': [
      'error',
      {
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md#groups-array
        groups: ['builtin', 'external', ['internal', 'parent', 'sibling', 'index']],
        'newlines-between': 'always',
      },
    ],
    'no-unneeded-ternary': ['error', { defaultAssignment: false }],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-unused-vars': ['warn', { vars: 'local', args: 'none' }],
    'max-len': [
      'warn',
      {
        code: 120,
        comments: 120,
        ignoreComments: false,
        ignoreTrailingComments: false,
        // We ignore long import/exports and commented JSX blocks
        ignorePattern: '^import .*|^export .*|<[A-Za-z].*',
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'prefer-object-spread': 2,
    'prefer-spread': 1,
    'prettier/prettier': 'warn',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'react/jsx-props-no-spreading': 0,
    'react/prop-types': 0,
    'react/no-array-index-key': 0,
    'react-hooks/exhaustive-deps': 1,
    'spaced-comment': [
      'warn',
      'always',
      {
        // Ignore typescript triple slash directives
        line: { markers: ['/'] },
      },
    ],
  },
};
