export const transformNullToUndefined = (obj: Record<string, unknown>) => {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, value === null ? undefined : value])
    );
};
