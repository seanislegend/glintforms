import {z} from 'zod';

export const exportSchema = z.object({
    applyActiveFilters: z.boolean().default(false),
    format: z.enum(['csv', 'json', 'excel', 'xlsform']),
    fields: z.union([z.literal('all'), z.array(z.string())]),
    filters: z
        .array(
            z.object({
                id: z.string(),
                value: z.array(z.union([z.boolean(), z.string(), z.number(), z.null()]))
            })
        )
        .default([]),
    includeAnswers: z.boolean().default(false),
    answerFields: z.union([z.literal('all'), z.array(z.string())]).optional(),
    codedAnswerDelimiter: z.string().default(', '),
    useCustomDelimiter: z.boolean().default(false)
});

export type ExportRequest = z.infer<typeof exportSchema>;
