import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import { configureVueProject } from '@vue/eslint-config-typescript';
import path from 'path';

const __dirname = path.resolve();

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

configureVueProject({ scriptLangs: ['ts', 'js'] });

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue,js,mjs,jsx}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname
      }
    }
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/package.json', '**/coverage/**', '**/node_modules/**']
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  skipFormatting,
  {
    rules: {
      // js/ts
      'comma-dangle': [
        'error',
        {
          arrays: 'only-multiline',
          objects: 'only-multiline',
          imports: 'only-multiline',
          exports: 'only-multiline',
          functions: 'never'
        }
      ],
      camelcase: ['error', { properties: 'never' }],
      'no-console': ['warn', { allow: ['error'] }],
      'no-debugger': 'warn',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
      'no-return-await': 'error',
      'no-var': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'prefer-const': ['warn', { destructuring: 'all', ignoreReadBeforeAssign: true }],
      'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: true }],
      'object-shorthand': ['error', 'always', { ignoreConstructors: false, avoidQuotes: true }],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',

      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',

      // best-practice
      'array-callback-return': 'error',
      'block-scoped-var': 'error',
      'no-alert': 'warn',
      'no-case-declarations': 'error',
      'no-multi-str': 'error',
      'no-with': 'error',
      'no-void': 'error',

      'sort-imports': [
        'off',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: false
        }
      ],

      // stylistic-issues
      'prefer-exponentiation-operator': 'error',

      // ts
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/ban-ts-comment': ['off', { 'ts-ignore': false }],
      '@typescript-eslint/no-unused-expressions': 'off',

      // vue
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/prefer-import-from-vue': 'off',
      'vue/no-v-text-v-html-on-component': 'off',
      'vue/html-self-closing': [
        'warn',
        {
          html: {
            void: 'always',
            normal: 'any',
            component: 'always'
          },
          svg: 'always',
          math: 'always'
        }
      ]
    }
  }
);
