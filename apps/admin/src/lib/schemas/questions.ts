import {z} from 'zod';
import {EXPORT_FORMATS} from '@/lib/schemas/constants';

export const questionTypeSchema = z.enum([
    /* i18n */ 'text',
    /* i18n */ 'number',
    /* i18n */ 'single_select',
    /* i18n */ 'multi_select'
]);

export type QuestionType = z.infer<typeof questionTypeSchema>;

export const validationRuleTypeSchema = z.enum([
    'minLength',
    'maxLength',
    'min',
    'max',
    'minSelections',
    'maxSelections',
    'email',
    'url'
]);

export type ValidationRuleType = z.infer<typeof validationRuleTypeSchema>;

export const validationRuleSchema = z.object({
    id: z.string(),
    type: validationRuleTypeSchema.optional(),
    value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    message: z.string().optional(),
    enabled: z.boolean()
});

export type ValidationRule = z.infer<typeof validationRuleSchema>;

export const questionOptionSchema = z.object({
    id: z.string(),
    value: z
        .string()
        .max(200, /* i18n */ 'Value is too long')
        .min(1, /* i18n */ 'Value is too short')
});

export type QuestionOption = z.infer<typeof questionOptionSchema>;

export const questionSchema = z
    .object({
        allowOther: z.boolean(),
        description: z.string().max(1000, /* i18n */ 'Description is too long').optional(),
        id: z.string(),
        order: z.number(),
        randomiseOptionsOrder: z.boolean(),
        required: z.boolean(),
        surveyId: z.string(),
        title: z
            .string()
            .max(200, /* i18n */ 'Title is too long')
            .min(2, /* i18n */ 'Title is too short'),
        type: questionTypeSchema,
        validations: z.array(validationRuleSchema)
    })
    .and(
        z.discriminatedUnion('type', [
            z.object({
                type: z.literal('text'),
                options: z.array(z.any())
            }),
            z.object({
                type: z.literal('single_select'),
                options: z
                    .array(questionOptionSchema)
                    .min(2, /* i18n */ 'At least two options are required')
            }),
            z.object({
                type: z.literal('multi_select'),
                options: z
                    .array(questionOptionSchema)
                    .min(2, /* i18n */ 'At least two options are required')
            }),
            z.object({
                type: z.literal('number'),
                options: z.array(z.any())
            })
        ])
    );

export type Question = z.infer<typeof questionSchema>;

export const questionsUpdateSchema = z.object({
    deletedQuestionIds: z.record(z.string(), z.boolean()).optional(),
    questions: z.array(questionSchema),
    surveyId: z.string()
});

export type QuestionsUpdate = z.infer<typeof questionsUpdateSchema>;

export const validationRuleConfigs: Record<
    ValidationRuleType,
    {
        label: string;
        description: string;
        requiresValue: boolean;
        valueType: 'string' | 'number' | 'boolean' | 'none';
        applicableTypes: QuestionType[];
        defaultMessage: string;
    }
> = {
    minLength: {
        label: /* i18n */ 'Minimum length',
        description: /* i18n */ 'Minimum number of characters',
        requiresValue: true,
        valueType: 'number',
        applicableTypes: ['text'],
        defaultMessage: /* i18n */ 'Must be at least {value} characters'
    },
    maxLength: {
        label: /* i18n */ 'Maximum length',
        description: /* i18n */ 'Maximum number of characters',
        requiresValue: true,
        valueType: 'number',
        applicableTypes: ['text'],
        defaultMessage: /* i18n */ 'Must be no more than {value} characters'
    },
    min: {
        label: /* i18n */ 'Minimum value',
        description: /* i18n */ 'Minimum numeric value',
        requiresValue: true,
        valueType: 'number',
        applicableTypes: ['number'],
        defaultMessage: /* i18n */ 'Must be at least {value}'
    },
    max: {
        label: /* i18n */ 'Maximum value',
        description: /* i18n */ 'Maximum numeric value',
        requiresValue: true,
        valueType: 'number',
        applicableTypes: ['number'],
        defaultMessage: /* i18n */ 'Must be no more than {value}'
    },
    maxSelections: {
        label: /* i18n */ 'Maximum selections',
        description: /* i18n */ 'Maximum number of options that can be selected',
        requiresValue: true,
        valueType: 'number',
        applicableTypes: ['multi_select'],
        defaultMessage: /* i18n */ 'You can select no more than {value} options'
    },
    minSelections: {
        label: /* i18n */ 'Minimum selections',
        description: /* i18n */ 'Minimum number of options that must be selected',
        requiresValue: true,
        valueType: 'number',
        applicableTypes: ['multi_select'],
        defaultMessage: /* i18n */ 'You must select at least {value} options'
    },
    email: {
        label: /* i18n */ 'Email format',
        description: /* i18n */ 'Must be a valid email address',
        requiresValue: false,
        valueType: 'none',
        applicableTypes: ['text'],
        defaultMessage: /* i18n */ 'Must be a valid email address'
    },
    url: {
        label: /* i18n */ 'URL format',
        description: /* i18n */ 'Must be a valid URL',
        requiresValue: false,
        valueType: 'none',
        applicableTypes: ['text'],
        defaultMessage: /* i18n */ 'Must be a valid URL'
    }
};

export const generateQuestionsSchema = z.object({
    topic: z
        .string()
        .min(1, /* i18n */ 'Topic is required')
        .max(200, /* i18n */ 'Topic is too long'),
    description: z
        .string()
        .min(1, /* i18n */ 'Description is required')
        .max(1000, /* i18n */ 'Description is too long'),
    questionCount: z
        .string()
        .refine(val => Number(val) >= 1, /* i18n */ 'Must generate at least 1 question')
        .refine(val => Number(val) <= 10, /* i18n */ 'Cannot generate more than 10 questions')
});

export type GenerateQuestionsForm = z.infer<typeof generateQuestionsSchema>;

export const generatedQuestionSchema = z.object({
    questions: z.array(
        z.object({
            title: z.string(),
            description: z.string().optional(),
            type: z.enum(['text', 'single_select', 'multi_select']),
            required: z.boolean(),
            allowOther: z.boolean(),
            randomiseOptionsOrder: z.boolean(),
            options: z.array(z.string())
        })
    )
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;

// import questions schema
export const importQuestionsSchema = z.object({
    file: z.any().refine(file => {
        if (!file || !(file instanceof File)) {
            return false;
        }

        // check mime type first
        const validMimeTypes = [
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (validMimeTypes.includes(file.type)) {
            return true;
        }

        // fallback to file extension check
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.csv', '.xlsx', '.xls'];

        return validExtensions.some(ext => fileName.endsWith(ext));
    }, /* i18n */ 'Please upload a CSV or XLSX file'),
    surveyId: z.string()
});

export type ImportQuestions = z.infer<typeof importQuestionsSchema>;

// ai parsed question schema for import
export const aiParsedQuestionSchema = z.object({
    questions: z.array(
        z.object({
            title: z
                .string()
                .min(2, /* i18n */ 'Title is too short')
                .max(200, /* i18n */ 'Title is too long'),
            description: z.string().max(1000, /* i18n */ 'Description is too long').optional(),
            type: z.enum(['text', 'number', 'single_select', 'multi_select']),
            required: z.boolean(),
            allowOther: z.boolean(),
            randomiseOptionsOrder: z.boolean(),
            options: z.array(z.string())
        })
    ),
    errors: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional()
});

export type AiParsedQuestion = z.infer<typeof aiParsedQuestionSchema>;

export const questionsExportSchema = z.object({
    fields: z.array(z.string()),
    format: z.enum(Object.keys(EXPORT_FORMATS)),
    includeAllFields: z.boolean()
});

export type QuestionsExport = z.infer<typeof questionsExportSchema>;
