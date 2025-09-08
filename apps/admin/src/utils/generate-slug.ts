export const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // remove special characters except hyphens
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-') // replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens
};
