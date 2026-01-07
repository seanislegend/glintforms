export interface ExtractedString {
    comment?: string;
    file: string;
    line: number;
    text: string;
}

export interface Occurrence {
    file: string;
    line: number;
}

export interface SourceEntry {
    added: string;
    hash: string;
    occurrences: Occurrence[];
    text: string;
}

export interface SourceFile {
    generated: string;
    keys: Record<string, SourceEntry>;
    version: string;
}

export type LocaleFile = Record<string, string>;

export interface AppConfig {
    localesDir: string;
    scanPaths: string[];
    typesOutput: string;
}

export interface Config {
    apps: Record<string, AppConfig>;
    exclude: string[];
    locales: string[];
    primaryLocale: string;
}
