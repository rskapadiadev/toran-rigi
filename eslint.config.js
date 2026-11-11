import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginRouter from '@tanstack/eslint-plugin-router';
import prettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Physical-direction utilities break RTL (Arabic/Urdu/Hebrew); use logical ms-/me-/ps-/pe-/start-/end-.
const physicalClass = String.raw`(^|\s)-?(ml|mr|pl|pr|left|right|rounded-l|rounded-r|border-l|border-r|text-left|text-right)-`;

export default tseslint.config(
    {
        ignores: [
            'dist',
            '.wrangler',
            '.output',
            '.dev',
            'node_modules',
            'migrations',
            'src/routeTree.gen.ts',
            'src/paraglide',
            'worker-configuration.d.ts',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            'simple-import-sort': simpleImportSort,
            'import-x': importX,
        },
        settings: { 'import-x/resolver-next': [createTypeScriptImportResolver()] },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
            '@typescript-eslint/no-non-null-assertion': 'error',
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'import-x/no-cycle': ['error', { maxDepth: 4 }],
        },
    },
    // Portability guard: only adapters and entries may touch Cloudflare or process.env.
    {
        files: ['src/**/*.{ts,tsx}', 'shared/**/*.ts', 'server/**/*.ts'],
        ignores: ['server/platform/**', 'server/entries/**', 'server/node-serve.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                'cloudflare:*',
                                '@cloudflare/*',
                                'drizzle-orm/d1',
                                'drizzle-orm/libsql',
                                '@libsql/*',
                            ],
                            message:
                                'Platform-specific code belongs in server/platform/* (ports & adapters).',
                        },
                    ],
                },
            ],
            'no-restricted-properties': [
                'error',
                {
                    object: 'process',
                    property: 'env',
                    message:
                        'Read settings via getPlatform().config so Node and Workers behave the same.',
                },
            ],
        },
    },
    // Layering guard: UI never imports server internals; shared stays dependency-free.
    {
        files: ['src/**/*.{ts,tsx}'],
        ignores: ['src/server.ts', 'src/server-fns/**'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@server/*', '../server/*', '../../server/*'],
                            message:
                                'UI code talks to the server through src/server-fns or /api only.',
                        },
                        {
                            group: ['cloudflare:*', '@cloudflare/*'],
                            message: 'Platform-specific code belongs in server/platform/*.',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['shared/**/*.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@/*', '@server/*', '../src/*', '../server/*'],
                            message: 'shared/ must not depend on src/ or server/.',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['server/**/*.ts'],
        ignores: ['server/repos/**', 'server/db/**', 'server/platform/**'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['drizzle-orm', 'drizzle-orm/*'],
                            message:
                                'Only server/repos/* may build queries; call a repository instead.',
                        },
                        {
                            group: ['cloudflare:*', '@cloudflare/*', '@libsql/*'],
                            message: 'Platform-specific code belongs in server/platform/*.',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: { globals: globals.browser },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            '@tanstack/query': pluginQuery,
            '@tanstack/router': pluginRouter,
            'jsx-a11y-x': jsxA11y,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            ...pluginQuery.configs.recommended.rules,
            ...pluginRouter.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,
            'react-refresh/only-export-components': 'off',
            'no-restricted-syntax': [
                'error',
                {
                    selector: `JSXAttribute[name.name='className'] Literal[value=/${physicalClass}/]`,
                    message:
                        'Use logical Tailwind utilities (ms-/me-/ps-/pe-/start-/end-/text-start) for RTL.',
                },
                {
                    selector: `JSXAttribute[name.name='className'] TemplateElement[value.raw=/${physicalClass}/]`,
                    message:
                        'Use logical Tailwind utilities (ms-/me-/ps-/pe-/start-/end-/text-start) for RTL.',
                },
            ],
        },
    },
    {
        files: ['server/**/*.ts', 'scripts/**/*.{ts,mjs}', 'tests/**/*.ts', '*.ts', '*.js'],
        languageOptions: { globals: globals.node },
    },
    {
        files: ['**/*.{js,mjs}'],
        ...tseslint.configs.disableTypeChecked,
    },
    prettier,
    // Re-enabled after eslint-config-prettier: object literals with 2+ props go one prop per line.
    {
        plugins: { '@stylistic': stylistic },
        rules: {
            '@stylistic/object-curly-newline': [
                'error',
                {
                    ObjectExpression: {
                        minProperties: 2,
                        multiline: true,
                    },
                },
            ],
            '@stylistic/object-property-newline': [
                'error',
                { allowAllPropertiesOnSameLine: false },
            ],
        },
    },
);
