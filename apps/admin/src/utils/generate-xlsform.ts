import * as XLSX from 'xlsx';

interface XLSFormData {
    survey: Record<string, unknown>[];
    choices: Record<string, unknown>[];
    settings: Record<string, unknown>[];
}

export const generateXLSForm = async (data: XLSFormData): Promise<Buffer> => {
    const workbook = XLSX.utils.book_new();

    if (data.survey.length > 0) {
        const surveyWorksheet = XLSX.utils.json_to_sheet(data.survey);
        XLSX.utils.book_append_sheet(workbook, surveyWorksheet, 'survey');
    }
    if (data.choices.length > 0) {
        const choicesWorksheet = XLSX.utils.json_to_sheet(data.choices);
        XLSX.utils.book_append_sheet(workbook, choicesWorksheet, 'choices');
    }
    if (data.settings.length > 0) {
        const settingsWorksheet = XLSX.utils.json_to_sheet(data.settings);
        XLSX.utils.book_append_sheet(workbook, settingsWorksheet, 'settings');
    }

    const buffer = XLSX.write(workbook, {type: 'buffer', bookType: 'xlsx'});
    return buffer;
};
