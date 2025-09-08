import {z} from 'zod';
import {EXPORT_FORMATS} from '@/lib/schemas/constants';

export const responsesExportSchema = z.object({
    format: z.enum(Object.keys(EXPORT_FORMATS)),
    includeAllFields: z.boolean(),
    fields: z.array(z.string()),
    includeAnswers: z.boolean(),
    applyActiveFilters: z.boolean(),
    includeAllAnswerFields: z.boolean(),
    answerFields: z.array(z.string()),
    codedAnswerDelimiter: z.string(),
    useCustomDelimiter: z.boolean()
});

export type ResponsesExport = z.infer<typeof responsesExportSchema>;
