import {z} from 'zod';
import {MAX_RESPONSE_HARD_LIMIT} from '@/lib/schemas/constants';

export type SurveyList = {
    campaignId: string;
    campaignTitle: string | null;
    createdAt: Date;
    id: string;
    status: string;
    title: string;
};

export const surveyInsertSchema = z.object({
    campaignId: z.string().optional(),
    description: z.string().max(1000, /* i18n */ 'Description is too long').optional(),
    newCampaignTitle: z
        .string()
        .max(200, /* i18n */ 'Campaign title is too long')
        .refine(val => val === '' || val.length >= 2, {
            message: /* i18n */ 'Campaign title must be at least 2 characters if provided'
        })
        .optional(),
    settings: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    slug: z.string().max(200, /* i18n */ 'Slug is too long').optional(),
    title: z
        .string()
        .max(200, /* i18n */ 'Title is too long')
        .min(2, /* i18n */ 'Title is too short')
});

export type SurveyInsert = z.infer<typeof surveyInsertSchema>;

export const surveyUpdateSchema = surveyInsertSchema.pick({
    description: true,
    slug: true,
    title: true
});

export type SurveyUpdate = z.infer<typeof surveyUpdateSchema>;

export const surveySettingsSchema = z
    .object({
        allowAnonymous: z.boolean(),
        changePassword: z.boolean().optional(),
        closeOnResponseLimit: z.boolean(),
        closedText: z.string().nullable().optional(),
        hasPassword: z.boolean().optional(),
        isPasswordProtected: z.boolean(),
        maxResponses: z
            .string()
            .refine(val => val === '' || !Number.isNaN(Number(val)), {
                message: /* i18n */ 'Maximum responses must be a number'
            })
            .refine(val => val === '' || Number(val) <= MAX_RESPONSE_HARD_LIMIT, {
                message: /* i18n */ `Maximum responses must be less than ${MAX_RESPONSE_HARD_LIMIT}`
            })
            .refine(val => val === '' || Number(val) > 0, {
                message: /* i18n */ 'Maximum responses must be greater than 0'
            }),
        password: z.string().nullable()
    })
    .superRefine((data, ctx) => {
        if (data.isPasswordProtected && !data.password) {
            // only add error if we're setting password for the first time
            // or if user wants to change the password but hasn't provided a new one
            if (!data.hasPassword || data.changePassword) {
                ctx.addIssue({
                    code: 'custom',
                    message:
                        /* i18n */ 'You must provide a password when password protection is enabled',
                    path: ['password']
                });
            }
        }
    });

export type SurveySettings = z.infer<typeof surveySettingsSchema>;
