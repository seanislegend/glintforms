import type {campaigns} from '@glint/database';
import {z} from 'zod';

export type CampaignList = Pick<
    typeof campaigns.$inferSelect,
    'id' | 'title' | 'description' | 'isActive'
>;

export const campaignInsertSchema = z.object({
    description: z.string().max(1000, 'Description is too long').optional(),
    isActive: z.boolean().default(true),
    tenantId: z.string(),
    title: z.string().max(200, 'Title is too long').min(2, 'Title is too short')
}) satisfies z.ZodType<Omit<typeof campaigns.$inferInsert, 'userId'>>;

export type CampaignInsert = z.infer<typeof campaignInsertSchema>;

export const campaignUpdateSchema = campaignInsertSchema.pick({title: true});

export type CampaignUpdate = z.infer<typeof campaignUpdateSchema>;
