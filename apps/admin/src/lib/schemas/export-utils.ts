import {type NextRequest, NextResponse} from 'next/server';
import {getSession} from '@/lib/auth/server';
import {CONTENT_TYPES} from '@/lib/schemas/constants';
import {exportSchema} from '@/lib/schemas/export';
import {generateCSV} from '@/utils/generate-csv';
import {generateExcel} from '@/utils/generate-excel';

interface ExportConfig<T> {
    dataFetcher: (surveyId: string, filters?: any) => Promise<T[]>;
    fieldMapper: (data: T[], selectedFields: string[]) => Record<string, any>[];
    exportFields: Array<{key: string; label: string; description: string}>;
    filenamePrefix: string;
    dataProcessor?: (data: T[], selectedFields: string[], options?: any) => Promise<any[]> | any[];
    fieldResolver?: (selectedFields: string[], options: any) => string[];
}

interface ExportOptions {
    format: 'csv' | 'json' | 'excel' | 'xlsform';
    fields: string[] | 'all';
    filters?: any;
    [key: string]: any;
}

export const createExportHandler = <T>(config: ExportConfig<T>) => {
    return async (request: NextRequest, {params}: {params: Promise<{surveyId: string}>}) => {
        try {
            const session = await getSession();
            if (!session) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

            const {surveyId} = await params;
            const body = await request.json();
            const exportOptions = exportSchema.parse(body);

            const data = await config.dataFetcher(surveyId, exportOptions.filters);
            const selectedFields =
                exportOptions.fields === 'all'
                    ? config.exportFields.map(f => f.key)
                    : exportOptions.fields;

            const processedData = config.dataProcessor
                ? await Promise.resolve(
                      config.dataProcessor(data, selectedFields, {...exportOptions, surveyId})
                  )
                : config.fieldMapper(data, selectedFields);

            const {content, contentType, filename} = await generateExportContent(
                processedData,
                selectedFields,
                exportOptions,
                config.filenamePrefix,
                surveyId,
                config.fieldResolver
            );

            return new NextResponse(content, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${filename}"`
                }
            });
        } catch (error) {
            console.error('Export error:', error);
            return NextResponse.json({error: 'Export failed'}, {status: 500});
        }
    };
};

const generateExportContent = async (
    data: Record<string, any>[],
    fields: string[],
    options: ExportOptions,
    filenamePrefix: string,
    surveyId: string,
    fieldResolver?: (selectedFields: string[], options: any) => string[]
) => {
    let content: string | Buffer;
    let contentType: string;
    let filename: string = `${filenamePrefix}-${surveyId}`;

    switch (options.format) {
        case 'csv': {
            const csvFields = fieldResolver ? fieldResolver(fields, options) : fields;
            content = generateCSV(data, csvFields);
            contentType = CONTENT_TYPES.csv;
            filename = `${filenamePrefix}-${surveyId}.csv`;
            break;
        }
        case 'json':
            content = JSON.stringify(data, null, 2);
            contentType = CONTENT_TYPES.json;
            filename = `${filenamePrefix}-${surveyId}.json`;
            break;
        case 'excel':
            content = await generateExcel(data);
            contentType = CONTENT_TYPES.excel;
            filename = `${filenamePrefix}-${surveyId}.xlsx`;
            break;

        default:
            throw new Error('Invalid format');
    }

    return {content, contentType, filename};
};
