import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default [
  // Vue3 推奨ルール
  ...pluginVue.configs['flat/recommended'],

  // TypeScript 推奨ルール（グローバル展開でパーサーが上書きされる）
  ...tseslint.configs.recommended,

  // .vue ファイル用: tseslint の上書きを打ち消して vue-eslint-parser を再設定
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  {
    ignores: [
      'src/api/generated/**',
      'dist/**',
      'node_modules/**',
      '*.config.ts',
      '*.config.js',
    ],
  },
]
