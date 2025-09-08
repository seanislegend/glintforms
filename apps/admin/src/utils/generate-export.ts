export const generateCSV = (data: Record<string, unknown>[], fields: string[]): string => {
    const headers = fields.map(field => `"${field}"`).join(',');
    const rows = data.map(row =>
        fields
            .map(field => {
                const value = row[field];
                if (value === null || value === undefined) {
                    return '""';
                }
                if (typeof value === 'object') {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(',')
    );

    return [headers, ...rows].join('\n');
};
