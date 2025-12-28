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
    countries: z.array(z.string().min(1)).min(1, 'at least one country required')
});

// single choice screener config input schema (accepts optional ids)
const singleChoiceScreenerConfigInputSchema = z.object({
    correctOptionId: z.string().uuid(),
    options: z.array(
        z.object({
            id: z.string().uuid().optional(),
            value: z.string().min(1)
        })
    ),
    question: z.string().min(1)
});

// single choice screener config output schema (requires ids)
const singleChoiceScreenerConfigOutputSchema = z.object({
    correctOptionId: z.string().uuid(),
    options: z
        .array(
            z.object({
                id: z.string().uuid(),
                value: z.string().min(1)
            })
        )
        .min(2, 'at least two options required'),
    question: z.string().min(1, 'question is required')
});

// single choice screener config with transform
const singleChoiceScreenerConfigSchema = singleChoiceScreenerConfigInputSchema
    .transform(data => ({
        ...data,
        options: data.options.map(opt => ({
            id: opt.id || crypto.randomUUID(),
            value: opt.value
        }))
    }))
    .pipe(singleChoiceScreenerConfigOutputSchema)
    .refine(data => data.options.some(opt => opt.id === data.correctOptionId), {
        message: 'correctOptionId must match one of the option IDs',
        path: ['correctOptionId']
    });

// discriminated union for screener configs
const screenerConfigSchema = z.discriminatedUnion('type', [
    z.object({config: ageScreenerConfigSchema, type: z.literal('age')}),
    z.object({config: locationScreenerConfigSchema, type: z.literal('location')}),
    z.object({config: singleChoiceScreenerConfigSchema, type: z.literal('single_choice')})
]);

export const screenerCreateSchema = z
    .object({
        description: z.string().optional(),
        name: z
            .string()
            .min(1, 'name is required')
            .max(255, 'name must be less than 255 characters')
    })
    .and(screenerConfigSchema);

export const screenerUpdateSchema = z
    .object({
        config: z
            .union([
                ageScreenerConfigSchema,
                locationScreenerConfigSchema,
                singleChoiceScreenerConfigSchema
            ])
            .optional(),
        description: z.string().optional(),
        name: z.string().min(1).max(255).optional(),
        type: z.enum(['age', 'location', 'single_choice']).optional()
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
