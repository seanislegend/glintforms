import {createHash} from 'node:crypto';
import {basename} from 'node:path';

export const generateKey = (text: string, filepath: string): string => {
    // handle common strings used across multiple files
    if (filepath === 'common') {
        const hash = hashText(text).slice(0, 7);
        return `common.${hash}`;
    }
    
    const pathParts = extractPathParts(filepath);
    const hash = hashText(text).slice(0, 7);

    const parts = [...pathParts, hash].filter(Boolean);
    return parts.join('.');
};

export const hashText = (text: string): string => {
    return createHash('sha256').update(text).digest('hex');
};

const extractPathParts = (filepath: string): string[] => {
    // normalize path separators and remove noise
    let path = filepath.replace(/\\/g, '/');

    // extract scope (app or package name) and remaining path
    const appsMatch = path.match(/apps\/([^/]+)\/(.+)/);
    const packagesMatch = path.match(/packages\/([^/]+)\/(.+)/);

    let scope = '';
    if (appsMatch?.[1] && appsMatch?.[2]) {
        scope = appsMatch[1]; // app name
        path = appsMatch[2]; // everything after apps/{appname}/
    } else if (packagesMatch?.[1] && packagesMatch?.[2]) {
        scope = packagesMatch[1]; // package name
        path = packagesMatch[2]; // everything after packages/{packagename}/
    }

    // remove common noise directories
    path = path.replace(/^src\//, '');
    path = path.replace(/^app\//, '');
    path = path.replace(/^components\//, '');

    // remove Next.js route groups and dynamic segments
    path = path.replace(/\([^)]+\)\//g, '');
    path = path.replace(/\[[^\]]+\]\//g, '');

    // split into parts
    const parts = path.split('/');

    // take meaningful segments (skip last part which is filename)
    const meaningful = parts.slice(0, -1).filter(part => {
        return (
            part &&
            part !== 'src' &&
            part !== 'app' &&
            part !== 'components' &&
            part !== 'lib' &&
            part !== 'utils'
        );
    });

    // add filename without extension
    const filename = basename(parts[parts.length - 1] || '', '.tsx')
        .replace('.ts', '')
        .replace('.jsx', '')
        .replace('.js', '');

    if (filename && filename !== 'index' && filename !== 'page') {
        meaningful.push(filename);
    }

    // prepend scope and convert to camelCase
    const result = scope ? [scope, ...meaningful] : meaningful;

    return result
        .slice(0, 3)
        .map(part => toCamelCase(part))
        .filter(Boolean);
};

const toCamelCase = (str: string): string => {
    return str
        .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
        .replace(/^(.)/, char => char.toLowerCase());
};
