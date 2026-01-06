/// <reference types="bun-types" />

import {parse} from '@babel/parser';
import traverseImport from '@babel/traverse';
import type {CallExpression, StringLiteral, TemplateLiteral} from '@babel/types';
import type {ExtractedString} from '../types.js';

// handle ESM/CJS default export
const traverse = (traverseImport as any).default || traverseImport;

interface Warning {
    file: string;
    line: number;
    reason: string;
}

export interface ParseResult {
    extracted: ExtractedString[];
    warnings: Warning[];
}

export const parseFile = async (filepath: string): Promise<ParseResult> => {
    const extracted: ExtractedString[] = [];
    const warnings: Warning[] = [];

    try {
        const file = Bun.file(filepath);
        const content = await file.text();
        const ast = parse(content, {
            plugins: ['typescript', 'jsx'],
            sourceType: 'module'
        });

        traverse(ast, {
            CallExpression(path: any) {
                const node = path.node as CallExpression;

                // check if this is a t() call
                if (node.callee.type === 'Identifier' && node.callee.name === 't') {
                    const arg = node.arguments[0];

                    if (!arg) {
                        warnings.push({
                            file: filepath,
                            line: node.loc?.start.line || 0,
                            reason: 't() called without arguments'
                        });
                        return;
                    }

                    // extract string literal
                    if (arg.type === 'StringLiteral') {
                        const literal = arg as StringLiteral;
                        extracted.push({
                            file: filepath,
                            line: node.loc?.start.line || 0,
                            text: literal.value
                        });
                        return;
                    }

                    // extract template literal without expressions
                    if (arg.type === 'TemplateLiteral') {
                        const template = arg as TemplateLiteral;
                        if (template.expressions.length === 0 && template.quasis[0]) {
                            extracted.push({
                                file: filepath,
                                line: node.loc?.start.line || 0,
                                text: template.quasis[0].value.cooked || ''
                            });
                            return;
                        }
                        warnings.push({
                            file: filepath,
                            line: node.loc?.start.line || 0,
                            reason: 't() called with template literal containing expressions (not supported)'
                        });
                        return;
                    }

                    // warn about dynamic calls
                    warnings.push({
                        file: filepath,
                        line: node.loc?.start.line || 0,
                        reason: `t() called with ${arg.type} (only string literals supported)`
                    });
                }
            }
        });

        return {extracted, warnings};
    } catch (error) {
        throw new Error(
            `Failed to parse ${filepath}: ${error instanceof Error ? error.message : String(error)}`
        );
    }
};
