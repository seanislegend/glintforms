export const mapObjectValuesToNumber = <TData extends Record<string, number | null | string>>(
    obj: TData,
    onlyKeys: string[] = []
): TData => {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            key,
            !onlyKeys?.length || onlyKeys.includes(key)
                ? typeof value === 'string'
                    ? parseInt(value)
                    : value
                : value
        ])
    ) as TData;
};
