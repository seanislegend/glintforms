export function humanise(str: string | null | undefined): string {
    if (!str) return '';

    const words = str.split('_').map(word => word.toLowerCase());

    if (words.length > 0 && words[0]) {
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }

    return words.join(' ');
}
