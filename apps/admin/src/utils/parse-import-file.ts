import * as XLSX from 'xlsx';

export interface ParsedRow {
    [key: string]: string | number | boolean | null;
}

export const parseImportFile = async (file: File): Promise<ParsedRow[]> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    // check mime type first
    if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
        return parseCsvFile(file);
    } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType === 'application/vnd.ms-excel' ||
        fileName.endsWith('.xlsx') ||
        fileName.endsWith('.xls')
    ) {
        return parseXlsxFile(file);
    } else {
        throw new Error('Unsupported file type. Please upload a CSV or XLSX file.');
    }
};

const parseCsvFile = async (file: File): Promise<ParsedRow[]> => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row.');
    }

    const headers = lines[0]?.split(',').map(header => header.trim().replace(/"/g, '')) ?? [];
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i]?.split(',').map(value => value.trim().replace(/"/g, ''));
        const row: ParsedRow = {};

        headers.forEach((header, index) => {
            row[header] = values?.[index] ?? null;
        });

        rows.push(row);
    }

    return rows;
};

const parseXlsxFile = async (file: File): Promise<ParsedRow[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, {type: 'array'});
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
        throw new Error('XLSX file must contain at least one worksheet.');
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
        throw new Error('XLSX file must contain at least one worksheet.');
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});

    if (jsonData.length < 2) {
        throw new Error('XLSX file must contain at least a header row and one data row.');
    }

    const headers = (jsonData[0] as string[]).map(header => String(header).trim());
    const rows: ParsedRow[] = [];

    for (let i = 1; i < jsonData.length; i++) {
        const values = jsonData[i] as any[];
        const row: ParsedRow = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || null;
        });

        rows.push(row);
    }

    return rows;
};
