import type {questions} from '@glint/database';
import {z} from 'zod';
import type {ValidationRule} from './types/validations';

const applyValidationRules = (
    base: z.ZodTypeAny,
    validations: ValidationRule[],
    type: string
): z.ZodTypeAny => {
    let schema = base;
    for (const rule of validations || []) {
        switch (rule.type) {
            case 'minLength':
                if (type === 'text' && typeof rule.value === 'number') {
                    const minLength = rule.value as number;
                    schema = schema.refine(
                        (val: string) => val.length >= minLength,
                        rule.message || `Must be at least ${minLength} characters`
                    );
                }
                break;
            case 'maxLength':
                if (type === 'text' && typeof rule.value === 'number') {
                    const maxLength = rule.value as number;
                    schema = schema.refine(
                        (val: string) => val.length <= maxLength,
                        rule.message || `Must be no more than ${maxLength} characters`
                    );
                }
                break;
            case 'min':
                if (type === 'number' && typeof rule.value === 'number') {
                    const minValue = rule.value as number;
                    schema = schema.refine(
                        (val: number) => val >= minValue,
                        rule.message || `Must be at least ${minValue}`
                    );
                }
                break;
            case 'max':
                if (type === 'number' && typeof rule.value === 'number') {
                    const maxValue = rule.value as number;
                    schema = schema.refine(
                        (val: number) => val <= maxValue,
                        rule.message || `Must be no more than ${maxValue}`
                    );
                }
                break;
            case 'minSelections':
                if (type === 'multi_select' && typeof rule.value === 'number') {
                    const minSelections = rule.value as number;
                    schema = schema.refine(
                        (vals: string[]) => vals.length >= minSelections,
                        rule.message || `You must select at least ${rule.value} options`
                    );
                }
                break;
            case 'maxSelections':
                if (type === 'multi_select' && typeof rule.value === 'number') {
                    const maxSelections = rule.value as number;
                    schema = schema.refine(
                        (vals: string[]) => vals.length <= maxSelections,
                        rule.message || `You can select no more than ${rule.value} options`
                    );
                }
                break;
            case 'email':
                if (type === 'text') {
                    schema = schema.refine(
                        (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
                        rule.message || 'Must be a valid email address'
                    );
                }
                break;
            case 'url':
                if (type === 'text') {
                    schema = schema.refine((val: string) => {
                        try {
                            new URL(val);
                            return true;
                        } catch {
                            return false;
                        }
                    }, rule.message || 'Must be a valid URL');
                }
                break;
        }
    }
    return schema;
};

const makeOptional = <T extends z.ZodTypeAny>(schema: T, required: boolean) => {
    if (required) return schema;
    return schema.nullable().or(z.literal('')).optional();
};

const buildOptionValidation = (
    type: 'single_select' | 'multi_select',
    options: {id: string; value: string}[] | null,
    allowOther: boolean,
    required: boolean
): z.ZodTypeAny => {
    const validIds = options?.map(o => o.id) ?? [];
    const isValid = (val: string) => {
        if (validIds.includes(val)) return true;
        if (allowOther && val.length > 0) return true;
        return false;
    };

    if (type === 'single_select') {
        let schema: z.ZodString | z.ZodEffects<z.ZodString, string, string> = z.string();
        if (required) schema = schema.min(1, 'single select cannot be empty');
        if (validIds.length > 0) {
            schema = schema.refine(isValid, 'selected option is not valid');
        }
        return schema;
    }

    if (type === 'multi_select') {
        let schema:
            | z.ZodArray<z.ZodString, 'many'>
            | z.ZodEffects<z.ZodArray<z.ZodString, 'many'>, string[], string[]> = z.array(
            z.string()
        );
        if (required) schema = schema.min(1, 'multi select must have at least one option');
        if (validIds.length > 0) {
            schema = schema.refine(
                arr => arr.every(isValid),
                'one or more selected options are not valid'
            );
        }
        return schema;
    }

    return z.any();
};

const buildBaseValidation = (q: Question): z.ZodTypeAny => {
    switch (q.type) {
        case 'text':
            return z.string().min(1, 'text answer cannot be empty');
        case 'number':
            return z.number();
        case 'single_select':
        case 'multi_select':
            return buildOptionValidation(
                q.type as any,
                q.options as any,
                !!q.allowOther,
                q.required
            );
        default:
            return z.any();
    }
};

export type ResponseSubmissionBody = {
    answers: Record<
        string,
        {
            endedAt: Date;
            metadata?: {questionVersion?: number};
            startedAt: Date;
            value: unknown;
            wasSkipped: boolean;
        }
    >;
    metadata?: {ip?: string; ua?: string};
    respondent?: {
        email: string;
        gender?: 'female' | 'male' | 'other' | 'prefer_not_to_say' | null;
        locationCity?: string | null;
        locationCountry?: string | null;
        name: string;
        notes?: string | null;
        signupSource?: string | null;
    };
};

export const createResponseSchema = (surveyQuestions: (typeof questions.$inferSelect)[]) => {
    const answerValidations: Record<string, z.ZodTypeAny> = {};

    for (const q of surveyQuestions) {
        const base = buildBaseValidation(q as Question);
        const wrapped = makeOptional(base, q.required);
        const withRules = applyValidationRules(
            wrapped,
            (q.validations as ValidationRule[]) ?? [],
            q.type
        );
        const questionAnswerSchema = z.object({
            endedAt: z
                .string()
                .datetime({message: 'endedAt must be a valid ISO date string'})
                .transform(val => new Date(val)),
            metadata: z
                .object({questionVersion: z.number().int().positive().optional()})
                .optional(),
            startedAt: z
                .string()
                .datetime({message: 'startedAt must be a valid ISO date string'})
                .transform(val => new Date(val)),
            value: withRules,
            wasSkipped: z.boolean()
        });

        answerValidations[q.id] = q.required
            ? questionAnswerSchema
            : questionAnswerSchema.optional();
    }

    return z.object({
        answers: z
            .object(answerValidations)
            .refine(obj => Object.keys(obj).length > 0, 'answers cannot be empty')
            .refine(obj => {
                for (const q of surveyQuestions) {
                    if (q.required && !(q.id in obj)) return false;
                }
                return true;
            }, 'all required questions must be answered'),
        respondent: z
            .object({
                email: z.string().email(),
                gender: z
                    .enum(['female', 'male', 'other', 'prefer_not_to_say'])
                    .nullable()
                    .optional(),
                locationCity: z.string().nullable().optional(),
                locationCountry: z.string().nullable().optional(),
                name: z.string().min(1),
                notes: z.string().nullable().optional(),
                signupSource: z.string().nullable().optional()
            })
            .optional()
    });
};
