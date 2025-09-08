import path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {environment: 'node', globals: true},
    esbuild: {target: 'node20'},
    resolve: {alias: {'@': path.resolve(__dirname, './src')}, conditions: ['import', 'node']}
});
