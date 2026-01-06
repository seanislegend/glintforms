#!/usr/bin/env node

import { Command } from 'commander';
import { checkCommand } from './commands/check.js';
import { extractCommand } from './commands/extract.js';
import { loadConfig } from '../config.js';

const program = new Command();

program
    .name("translation")
    .description("CLI for extracting and managing translations")
    .version("0.1.0");

program
    .command('extract')
    .description('Extract translatable strings from source code')
    .option(
        '-c, --config <path>',
        'Path to config file',
        '.translation.config.json',
    )
    .option(
        '-a, --app <name>',
        'Extract for specific app only',
    )
    .action(async (options) => {
        try {
            const config = loadConfig(options.config);
            console.log('Extracting translations...');

            const result = await extractCommand(config, options.app);

            console.log(`\n✓ Total: ${result.filesProcessed} files processed`);
            console.log(
                `✓ Total: ${result.stringsExtracted} strings extracted (${result.addedKeys.length} new)`,
            );

            if (result.addedKeys.length > 0) {
                console.log("\nAdded keys:");
                for (const key of result.addedKeys.slice(0, 10)) {
                    console.log(`  - ${key}`);
                }
                if (result.addedKeys.length > 10) {
                    console.log(`  ... and ${result.addedKeys.length - 10} more`);
                }
            }

            if (result.warnings.length > 0) {
                console.log(
                    `\n⚠ ${result.warnings.length} dynamic t() calls skipped:`,
                );
                for (const warning of result.warnings.slice(0, 5)) {
                    console.log(`  - ${warning.file}:${warning.line}: ${warning.reason}`);
                }
                if (result.warnings.length > 5) {
                    console.log(`  ... and ${result.warnings.length - 5} more`);
                }
            }

            process.exit(0);
        } catch (error) {
            console.error(
                "Error:",
                error instanceof Error ? error.message : String(error),
            );
            process.exit(error instanceof Error && error.message.includes("collision") ? 2 : error instanceof Error && error.message.includes("config") ? 3 : 1);
        }
    });

program
    .command("check")
    .description("Check translation completeness")
    .option("-l, --locale <locale>", "Check specific locale")
    .option("-a, --all", "Check all locales")
    .option("--app <name>", "Check specific app only")
    .option(
        "-c, --config <path>",
        "Path to config file",
        ".translation.config.json",
    )
    .action((options) => {
        try {
            const config = loadConfig(options.config);

            if (!options.locale && !options.all) {
                console.log(
                    "Please specify --locale <locale> or --all to check all locales",
                );
                process.exit(3);
            }

            const result = checkCommand(config, {
                all: options.all,
                app: options.app,
                locale: options.locale,
            });

            if (result.complete) {
                console.log("✓ All translations complete");
                process.exit(0);
            }

            // group by locale
            const byLocale = new Map<string, typeof result.missing>();
            for (const item of result.missing) {
                const items = byLocale.get(item.locale) || [];
                items.push(item);
                byLocale.set(item.locale, items);
            }

            console.log(`✗ ${result.missing.length} missing translations:\n`);

            for (const [locale, items] of byLocale) {
                console.log(`Locale: ${locale}`);
                for (const item of items.slice(0, 10)) {
                    console.log(`  - ${item.key}`);
                    console.log(`    "${item.text}"`);
                    const firstOcc = item.occurrences[0];
                    if (firstOcc) {
                        console.log(`    ${firstOcc.file}:${firstOcc.line}`);
                    }
                }
                if (items.length > 10) {
                    console.log(`  ... and ${items.length - 10} more`);
                }
                console.log();
            }

            process.exit(5);
        } catch (error) {
            console.error(
                "Error:",
                error instanceof Error ? error.message : String(error),
            );
            process.exit(3);
        }
    });

program.parse();

