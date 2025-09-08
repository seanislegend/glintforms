import {z} from 'zod';
import {EXPORT_FORMATS} from '@/lib/schemas/constants';

export const questionTypeSchema = z.enum(['text', 'number', 'single_select', 'multi_select']);

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
    value: z.string().max(200, 'Value is too long').min(1, 'Value is too short')
});

export type QuestionOption = z.infer<typeof questionOptionSchema>;

export const questionSchema = z
    .object({
        allowOther: z.boolean(),
        description: z.string().max(1000, 'Description is too long').optional(),
        id: z.string(),
        order: z.number(),
        randomiseOptionsOrder: z.boolean(),
        required: z.boolean(),
        surveyId: z.string(),
        title: z.string().max(200, 'Title is too long').min(2, 'Title is too short'),
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
                options: z.array(questionOptionSchema).min(2, 'At least two options are required')
            }),
            z.object({
                type: z.literal('multi_select'),
                options: z.array(questionOptionSchema).min(2, 'At least two options are required')
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
        label: 'Minimum length',
        description: 'Minimum number of characters',
        requiresValue: true,
        valueType: 'number',
        applicableTypes: ['text'],
        defaultMessage: 'Must be at least {value} characters'
    },
    maxLength: {
        label: 'Maximum length',
        description: 'Maximum number of characters',
        requiresValue: true,
        valueType: 'number',
        applicableTypes: ['text'],
        defaultMessage: 'Must be no more than {value} characters'
    },
    min: {
        label: 'Minimum value',
        description: 'Minimum numeric value',
        requiresValue: true,
        valueType: 'number',
        applicableTypes: ['number'],
        defaultMessage: 'Must be at least {value}'
    },
    max: {
        label: 'Maximum value',
        description: 'Maximum numeric value',
        requiresValue: true,
        valueType: 'number',
        applicableTypes: ['number'],
        defaultMessage: 'Must be no more than {value}'
    },
    maxSelections: {
        label: 'Maximum selections',
        description: 'Maximum number of options that can be selected',
        requiresValue: true,
        valueType: 'number',
        applicableTypes: ['multi_select'],
        defaultMessage: 'You can select no more than {value} options'
    },
    minSelections: {
        label: 'Minimum selections',
        description: 'Minimum number of options that must be selected',
        requiresValue: true,
        valueType: 'number',
        applicableTypes: ['multi_select'],
        defaultMessage: 'You must select at least {value} options'
    },
    email: {
        label: 'Email format',
        description: 'Must be a valid email address',
        requiresValue: false,
        valueType: 'none',
        applicableTypes: ['text'],
        defaultMessage: 'Must be a valid email address'
    },
    url: {
        label: 'URL format',
        description: 'Must be a valid URL',
        requiresValue: false,
        valueType: 'none',
        applicableTypes: ['text'],
        defaultMessage: 'Must be a valid URL'
    }
};

export const generateQuestionsSchema = z.object({
    topic: z.string().min(1, 'Topic is required').max(200, 'Topic is too long'),
    description: z.string().min(1, 'Description is required').max(1000, 'Description is too long'),
    questionCount: z
        .string()
        .refine(val => Number(val) >= 1, 'Must generate at least 1 question')
        .refine(val => Number(val) <= 10, 'Cannot generate more than 10 questions')
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
    }, 'Please upload a CSV or XLSX file'),
    surveyId: z.string()
});

export type ImportQuestions = z.infer<typeof importQuestionsSchema>;

// ai parsed question schema for import
export const aiParsedQuestionSchema = z.object({
    questions: z.array(
        z.object({
            title: z.string().min(2, 'Title is too short').max(200, 'Title is too long'),
            description: z.string().max(1000, 'Description is too long').optional(),
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
