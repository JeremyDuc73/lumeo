module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
        ecmaVersion: 2023,
        extraFileExtensions: ['.vue']
    },
    extends: ['@nuxtjs/eslint-config-typescript', 'plugin:vue/vue3-recommended', 'plugin:prettier/recommended', 'plugin:@typescript-eslint/recommended'],
    plugins: ['prettier', '@typescript-eslint'],
    rules: {
        'vue/multi-word-component-names': 'off',
        'vue/no-multiple-template-root': 'off',
        'vue/attribute-hyphenation': 'off',
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto'
            }
        ],
        'import/named': 'error',
        'import/namespace': 'error',
        'import/no-duplicates': 'error',
        'vue/v-on-event-hyphenation': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
    },
    settings: {
        'import/resolver': {
            typescript: true,
            node: true
        }
    }
};
