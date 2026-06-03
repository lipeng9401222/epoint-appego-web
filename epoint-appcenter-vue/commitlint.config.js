import { execSync } from 'child_process';

const scopes = ['frame', 'assets', 'components', 'config', 'directive', 'enums', 'hooks', 'layouts', 'locales', 'plugins', 'router', 'store', 'utils', 'views'];

const gitStatus = execSync('git status --porcelain || true').toString().trim().split('\n');
// 尝试从变更中获取 scope
const scopeComplete = gitStatus
  .find((r) => ~r.indexOf('M  src'))
  ?.replace(/\//g, '%%')
  ?.match(/src%%((\w|-)*)/)?.[1];

// const subjectComplete = '';

export default {
  rules: {
    /**
     * type[scope]: [function] description
     *      ^^^^^
     */
    'scope-enum': [2, 'always', scopes],
    /**
     * type[scope]: [function] description
     *
     * ^^^^^^^^^^^^^^ empty line.
     * - Something here
     */
    'body-leading-blank': [1, 'always'],
    /**
     * type[scope]: [function] description
     *
     * - something here
     *
     * ^^^^^^^^^^^^^^
     */
    'footer-leading-blank': [1, 'always'],
    /**
     * type[scope]: [function] description [No more than 72 characters]
     *      ^^^^^
     */
    'header-max-length': [2, 'always', 72],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [1, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    /**
     * type[scope]: [function] description
     * ^^^^
     */
    'type-enum': [2, 'always', ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'release', 'style', 'test', 'improvement']]
  },
  prompt: {
    useEmoji: true,
    messages: {
      type: "Select the type of change that you're committing: \n  请选择你的提交类型：",
      scope: 'Denote the SCOPE of this change (optional):\n  请描述更改的范围(可选的)',
      customScope: 'Denote the SCOPE of this change:',
      subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
      body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
      breaking: 'List any BREAKING CHANGES (optional). Use "|" to break new line:\n',
      footerPrefixesSelect: 'Select the ISSUES type of changeList by this change (optional):',
      customFooterPrefix: 'Input ISSUES prefix:',
      footer: 'List any ISSUES by this change. E.g.: #31, #34:\n',
      generatingByAI: 'Generating your AI commit subject...',
      generatedSelectByAI: 'Select suitable subject by AI generated:',
      confirmCommit: 'Are you sure you want to proceed with the commit above?'
    },
    types: [
      {
        value: 'feat',
        name: 'feat:     A new feature\n            添加了新的功能或特性',
        emoji: ':sparkles:'
      },
      {
        value: 'fix',
        name: 'fix:      A bug fix\n            修复了一个bug',
        emoji: ':bug:'
      },
      {
        value: 'docs',
        name: 'docs:     Documentation only changes\n            仅仅是文档的编写',
        emoji: ':memo:'
      },
      {
        value: 'style',
        name: 'style:    Changes that do not affect the meaning of the code\n            格式化代码,统一缩进,统一换行等',
        emoji: ':lipstick:'
      },
      {
        value: 'refactor',
        name: 'refactor: A code change that neither fixes a bug nor adds a feature\n            重构代码，非修复bug或新特性添加',
        emoji: ':recycle:'
      },
      {
        value: 'perf',
        name: 'perf:     A code change that improves performance\n            改善代码性能',
        emoji: ':zap:'
      },
      {
        value: 'test',
        name: 'test:     Adding missing tests or correcting existing tests\n            添加或修改测试代码',
        emoji: ':white_check_mark:'
      },
      {
        value: 'build',
        name: 'build:    Changes that affect the build system or external dependencies\n            影响构建系统或外部依赖关系的更改',
        emoji: ':package:'
      },
      {
        value: 'ci',
        name: 'ci:       Changes to our CI configuration files and scripts\n            更改我们的 CI 配置文件和脚本',
        emoji: ':ferris_wheel:'
      },
      {
        value: 'chore',
        name: "chore:    Other changes that don't modify src or test files\n            非 src 或测试文件的其他更改",
        emoji: ':hammer:'
      },
      {
        value: 'revert',
        name: 'revert:   Reverts a previous commit\n            回滚先前的提交',
        emoji: ':rewind:'
      }
    ],
    defaultScope: scopeComplete,
    customScopesAlign: !scopeComplete ? 'top' : 'bottom',
    // defaultSubject: subjectComplete && `[${subjectComplete}] `,
    allowCustomIssuePrefixs: false,
    allowEmptyIssuePrefixs: false
  }
};
