/// <reference types="bun-types" />

import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {z} from 'zod';
import type {Config} from './types.js';

const appConfigSchema = z
    .object({
        basePath: z.string().optional(),
        localesDir: z.string().optional(),
        scanPaths: z.array(z.string()).min(1).optional(),
        typesOutput: z.string().optional()
    })
    .refine(
        data => {
            // either basePath or all explicit paths must be provided
            return !!(data.basePath || (data.scanPaths && data.localesDir && data.typesOutput));
        },
        {
            message:
                'Either basePath or all of (scanPaths, localesDir, typesOutput) must be provided'
        }
    );

const configSchema = z.object({
    apps: z.record(z.string(), appConfigSchema),
    exclude: z
        .array(z.string())
        .default([
            '**/*.test.ts',
            '**/*.test.tsx',
            '**/*.spec.ts',
            '**/*.spec.tsx',
            '**/node_modules/**',
            '**/dist/**',
            '**/.next/**'
        ]),
    locales: z.array(z.string()).min(1),
    primaryLocale: z.string()
});

const findConfigFile = (startDir: string, configName: string): string | null => {
    let currentDir = startDir;
    const root = resolve('/');

    while (currentDir !== root) {
        const configPath = resolve(currentDir, configName);
        if (existsSync(configPath)) {
            return configPath;
        }
        currentDir = resolve(currentDir, '..');
    }

    // check root directory
    const rootConfigPath = resolve(root, configName);
    return existsSync(rootConfigPath) ? rootConfigPath : null;
};

export const loadConfig = async (configPath?: string): Promise<Config> => {
    // resolve config path
    const resolvedPath = configPath
        ? resolve(process.cwd(), configPath)
        : (() => {
              const configName = '.translation.config.json';
              const found = findConfigFile(process.cwd(), configName);
              if (!found) {
                  throw new Error(
                      `Could not find ${configName} in ${process.cwd()} or any parent directory`
                  );
              }
              return found;
          })();

    try {
        // use Bun APIs if available, otherwise fall back to Node.js
        const content =
            typeof Bun !== 'undefined'
                ? await Bun.file(resolvedPath).text()
                : await readFile(resolvedPath, 'utf-8');

        const json = JSON.parse(content);
        const parsed = configSchema.parse(json);

        // normalize app configs to always have explicit paths
        const normalizedApps = Object.fromEntries(
            Object.entries(parsed.apps).map(([appName, appConfig]) => {
                const normalized = appConfig.basePath
                    ? {
                          localesDir: `${appConfig.basePath}/locales`,
                          scanPaths: [`${appConfig.basePath}/src`],
                          typesOutput: `${appConfig.basePath}/locales/keys.ts`
                      }
                    : {
                          localesDir: appConfig.localesDir as string,
                          scanPaths: appConfig.scanPaths as string[],
                          typesOutput: appConfig.typesOutput as string
                      };
                return [appName, normalized];
            })
        );

        return {
            ...parsed,
            apps: normalizedApps
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load config from ${resolvedPath}: ${error.message}`);
        }
        throw error;
    }
};
