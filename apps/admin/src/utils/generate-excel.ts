import * as XLSX from 'xlsx';

export const generateExcel = async (data: Record<string, unknown>[]): Promise<Buffer> => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');
    const buffer = XLSX.write(workbook, {type: 'buffer', bookType: 'xlsx'});
    return buffer;
};
