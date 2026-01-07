import type {screeners} from '@glint/database';
import {z} from 'zod';

export type ScreenerList = Pick<
    typeof screeners.$inferSelect,
    'config' | 'createdAt' | 'description' | 'id' | 'name' | 'type' | 'updatedAt'
> & {
    surveyCount: number;
};

export type ScreenerDetails = typeof screeners.$inferSelect & {
    surveys: Array<{
        failureMessage: string | null;
        id: string;
        order: number;
        title: string;
    }>;
};

// age screener config
const ageScreenerConfigSchema = z.object({
    operator: z.enum(['over', 'under']),
    value: z.number().int().positive()
});

// location screener config
const locationScreenerConfigSchema = z.object({
    countries: z.array(z.string().min(1)).min(1, /* i18n */ 'At least one country required')
});

// selection screener config input schema (accepts optional ids)
const selectionScreenerConfigInputSchema = z.object({
    options: z.array(
        z.object({
            id: z.string().uuid().optional(),
            passes: z.boolean().optional(),
            value: z.string().min(1)
        })
    ),
    question: z.string().min(1)
});

// selection screener config output schema (requires ids)
const selectionScreenerConfigOutputSchema = z.object({
    options: z
        .array(
            z.object({
                id: z.string().uuid(),
                passes: z.boolean(),
                value: z.string().min(1)
            })
        )
        .min(2, /* i18n */ 'At least two options required'),
    question: z.string().min(1, /* i18n */ 'Question is required')
});

// selection screener config with transform
const selectionScreenerConfigSchema = selectionScreenerConfigInputSchema
    .transform(data => ({
        options: data.options.map(opt => ({
            id: opt.id || crypto.randomUUID(),
            passes: opt.passes ?? false,
            value: opt.value
        })),
        question: data.question
    }))
    .pipe(selectionScreenerConfigOutputSchema)
    .refine(data => data.options.some(opt => opt.passes), {
        message: /* i18n */ 'At least one option must pass',
        path: ['options']
    });

// discriminated union for screener configs
const screenerConfigSchema = z.discriminatedUnion('type', [
    z.object({config: ageScreenerConfigSchema, type: z.literal('age')}),
    z.object({config: locationScreenerConfigSchema, type: z.literal('location')}),
    z.object({config: selectionScreenerConfigSchema, type: z.literal('selection')})
]);

export const screenerCreateSchema = z
    .object({
        description: z.string().optional(),
        name: z
            .string()
            .min(1, /* i18n */ 'Name is required')
            .max(255, /* i18n */ 'Name must be less than 255 characters')
    })
    .and(screenerConfigSchema);

export const screenerUpdateSchema = z
    .object({
        config: z
            .union([
                ageScreenerConfigSchema,
                locationScreenerConfigSchema,
                selectionScreenerConfigSchema
            ])
            .optional(),
        description: z.string().optional(),
        name: z.string().min(1).max(255).optional(),
        type: z.enum(['age', 'location', 'selection']).optional()
    })
    .partial();

export type ScreenerCreate = z.input<typeof screenerCreateSchema>;
export type ScreenerUpdate = z.infer<typeof screenerUpdateSchema>;

// survey screener assignment schemas
export const assignScreenerSchema = z.object({
    failureMessage: z.string().optional(),
    screenerId: z.string().uuid(),
    surveyId: z.string().uuid()
});

export const removeScreenerSchema = z.object({
    screenerId: z.string().uuid(),
    surveyId: z.string().uuid()
});

export const updateScreenerOrderSchema = z.object({
    screenerId: z.string().uuid(),
    order: z.number().int().min(0),
    surveyId: z.string().uuid()
});

export const updateScreenerFailureMessageSchema = z.object({
    failureMessage: z.string().optional(),
    screenerId: z.string().uuid(),
    surveyId: z.string().uuid()
});

export type AssignScreener = z.infer<typeof assignScreenerSchema>;
export type RemoveScreener = z.infer<typeof removeScreenerSchema>;
export type UpdateScreenerOrder = z.infer<typeof updateScreenerOrderSchema>;
export type UpdateScreenerFailureMessage = z.infer<typeof updateScreenerFailureMessageSchema>;
