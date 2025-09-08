import path from 'node:path';
import {defineConfig} from 'vitest/config';
import tsconfig from './tsconfig.json';

const alias = Object.fromEntries(
    Object.entries(tsconfig.compilerOptions.paths).map(([key, [value]]) => [
        key.replace('/*', ''),
        path.resolve(__dirname, value?.replace('/*', '') ?? '')
    ])
);

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./tests/setup.ts']
    },
    esbuild: {target: 'node20'},
    resolve: {alias, conditions: ['import', 'node']}
});
