import path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./tests/setup.ts']
    },
    esbuild: {target: 'node20'},
    resolve: {
        conditions: ['import', 'node'],
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
