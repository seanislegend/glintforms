import type {cohorts} from '@glint/database';
import {z} from 'zod';

export type CohortList = Pick<
    typeof cohorts.$inferSelect,
    'id' | 'name' | 'description' | 'createdAt' | 'updatedAt'
> & {
    respondentCount: number;
};

export type CohortDetails = typeof cohorts.$inferSelect & {
    respondents: Array<{
        id: string;
        name: string;
        email: string;
        assignedAt: Date;
        assignedBy: string | null;
    }>;
};

export const cohortCreateSchema = z.object({
    description: z.string().optional(),
    name: z
        .string()
        .min(1, /* i18n */ 'Name is required')
        .max(255, /* i18n */ 'Name must be less than 255 characters')
});

export const cohortUpdateSchema = cohortCreateSchema.partial();

export type CohortCreate = z.infer<typeof cohortCreateSchema>;
export type CohortUpdate = z.infer<typeof cohortUpdateSchema>;

// cohort assignment schemas
export const assignCohortSchema = z.object({
    cohortId: z.string().uuid(),
    respondentId: z.string().uuid()
});

export const removeCohortSchema = z.object({
    cohortId: z.string().uuid(),
    respondentId: z.string().uuid()
});

export type AssignCohort = z.infer<typeof assignCohortSchema>;
export type RemoveCohort = z.infer<typeof removeCohortSchema>;
