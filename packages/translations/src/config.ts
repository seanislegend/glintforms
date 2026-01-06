import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import type { Config } from './types.js';

const appConfigSchema = z
    .object({
        basePath: z.string().optional(),
        localesDir: z.string().optional(),
        scanPaths: z.array(z.string()).min(1).optional(),
        typesOutput: z.string().optional(),
    })
    .refine(
        (data) => {
            // either basePath or all explicit paths must be provided
            const hasBasePath = Boolean(data.basePath);
            const hasExplicitPaths = Boolean(
                data.scanPaths && data.localesDir && data.typesOutput,
            );
            return hasBasePath || hasExplicitPaths;
        },
        {
            message:
                'Either basePath or all of (scanPaths, localesDir, typesOutput) must be provided',
        },
    );

const configSchema = z.object({
    apps: z.record(z.string(), appConfigSchema),
    exclude: z.array(z.string()).default([
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
    ]),
    locales: z.array(z.string()).min(1),
    primaryLocale: z.string(),
});

export const loadConfig = (configPath?: string): Config => {
    const path = configPath || '.translation.config.json';
    const resolvedPath = resolve(process.cwd(), path);

    try {
        const content = readFileSync(resolvedPath, 'utf-8');
        const json = JSON.parse(content);
        const parsed = configSchema.parse(json);

        // normalize app configs to always have explicit paths
        const normalizedApps: Record<string, Config['apps'][string]> = {};
        for (const [appName, appConfig] of Object.entries(parsed.apps)) {
            if (appConfig.basePath) {
                normalizedApps[appName] = {
                    localesDir: `${appConfig.basePath}/locales`,
                    scanPaths: [`${appConfig.basePath}/src`],
                    typesOutput: `${appConfig.basePath}/locales/keys.ts`,
                };
            } else {
                normalizedApps[appName] = {
                    localesDir: appConfig.localesDir!,
                    scanPaths: appConfig.scanPaths!,
                    typesOutput: appConfig.typesOutput!,
                };
            }
        }

        return {
            ...parsed,
            apps: normalizedApps,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load config from ${resolvedPath}: ${error.message}`);
        }
        throw error;
    }
};

