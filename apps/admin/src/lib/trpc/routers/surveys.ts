import {campaigns, questions, surveySettings, surveys} from '@glint/database';
import {encrypt} from '@glint/encryption';
import type {DeleteSurveyDataTaskPayload, GenerateThemesTaskPayload} from '@glint/jobs/schema';
import {tasks} from '@trigger.dev/sdk';
import {TRPCError} from '@trpc/server';
import {and, desc, eq, or} from 'drizzle-orm';
import {z} from 'zod';
import {surveyInsertSchema, surveySettingsSchema, surveyUpdateSchema} from '@/lib/schemas/surveys';
import {transformNullToUndefined} from '@/utils/database';
import {generateSlug} from '@/utils/generate-slug';
import {protectedProcedure} from '../init';

export const surveysRouter = {
    getAll: protectedProcedure.query(async ({ctx}) => {
        const data = await ctx.db
            .select({
                campaignId: surveys.campaignId,
                campaignTitle: campaigns.title,
                createdAt: surveys.createdAt,
                id: surveys.id,
                slug: surveys.slug,
                status: surveys.status,
                title: surveys.title
            })
            .from(surveys)
            .leftJoin(campaigns, eq(surveys.campaignId, campaigns.id))
            .orderBy(desc(surveys.createdAt))
            .where(eq(surveys.tenantId, ctx.tenant));
        return data;
    }),
    get: protectedProcedure.input(z.string()).query(async ({input, ctx}) => {
        const [data] = await ctx.db
            .select()
            .from(surveys)
            .leftJoin(campaigns, eq(surveys.campaignId, campaigns.id))
            .where(
                and(
                    or(eq(surveys.id, input), eq(surveys.slug, input)),
                    eq(surveys.tenantId, ctx.tenant)
                )
            )
            .limit(1);
        if (!data?.surveys || !data?.campaigns) return null;

        const surveyWithCampaign = {
            ...data.surveys,
            campaign: data.campaigns
        };

        return surveyWithCampaign;
    }),
    create: protectedProcedure.input(surveyInsertSchema).mutation(async ({input, ctx}) => {
        let finalCampaignId = input.campaignId;
        // create new campaign if a title is provided and no campaign is selected
        if (input.newCampaignTitle && !input.campaignId) {
            const [newCampaign] = await ctx.db
                .insert(campaigns)
                .values({
                    title: input.newCampaignTitle,
                    tenantId: ctx.tenant
                })
                .returning();
            if (!newCampaign) {
                throw new Error('Failed to create campaign');
            }
            finalCampaignId = newCampaign.id;
        }

        if (!finalCampaignId) {
            throw new Error('No campaign ID provided');
        }

        // generate slug from title if not provided
        const slug = input.slug || generateSlug(input.title);

        const [data] = await ctx.db
            .insert(surveys)
            .values({
                campaignId: finalCampaignId,
                description: input.description,
                settings: input.settings,
                slug,
                tenantId: ctx.tenant,
                title: input.title
            })
            .returning();
        return data;
    }),
    update: protectedProcedure
        .input(z.object({id: z.string()}).merge(surveyUpdateSchema))
        .mutation(async ({input, ctx}) => {
            const {id, ...updateData} = input;

            // generate slug from title if title is being updated and slug is not provided
            if (updateData.title && !updateData.slug) {
                updateData.slug = generateSlug(updateData.title);
            }

            const [data] = await ctx.db
                .update(surveys)
                .set({...updateData, updatedAt: new Date()})
                .where(and(eq(surveys.id, id), eq(surveys.tenantId, ctx.tenant)))
                .returning();
            return data;
        }),
    updateStatus: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                status: z.enum(['draft', 'testing', 'active', 'complete', 'archived'])
            })
        )
        .mutation(async ({input, ctx}) => {
            const {id, status} = input;
            const updateData: any = {status, updatedAt: new Date()};

            const [survey] = await ctx.db
                .select()
                .from(surveys)
                .where(and(eq(surveys.id, id), eq(surveys.tenantId, ctx.tenant)));
            if (!survey) {
                throw new TRPCError({code: 'NOT_FOUND', message: 'Survey not found'});
            }

            // if the status is changing to anything but draft, we need to check if the
            // survey has questions.
            if (status !== 'draft') {
                const [allQuestions] = await ctx.db
                    .select()
                    .from(questions)
                    .where(eq(questions.surveyId, id));
                if (!allQuestions) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message:
                            'This survey has no questions. Before the status can be changed, at least one question must be added.'
                    });
                }
            }

            if (status === 'active' && survey.status === 'testing') {
                // clear all data that has been collected during testing
                await tasks.trigger('delete-survey-data', {
                    surveyId: id,
                    tenantId: ctx.tenant
                } satisfies DeleteSurveyDataTaskPayload);
            }

            // generate themes when moving from active to complete
            if (status === 'complete' && survey.status === 'active') {
                await tasks.trigger('generate-themes', {
                    surveyId: id,
                    tenantId: ctx.tenant
                } satisfies GenerateThemesTaskPayload);
            }

            // set launchedAt when moving to active status
            if (status === 'active') {
                updateData.launchedAt = new Date();
            }

            const [data] = await ctx.db
                .update(surveys)
                .set(updateData)
                .where(and(eq(surveys.id, id), eq(surveys.tenantId, ctx.tenant)))
                .returning();
            return data;
        }),
    getSettings: protectedProcedure.input(z.string()).query(async ({input, ctx}) => {
        const [settings] = await ctx.db
            .select({
                password: surveySettings.password,
                allowAnonymous: surveySettings.allowAnonymous,
                closeOnResponseLimit: surveySettings.closeOnResponseLimit,
                closedText: surveySettings.closedText,
                isPasswordProtected: surveySettings.isPasswordProtected,
                maxResponses: surveySettings.maxResponses
            })
            .from(surveySettings)
            .innerJoin(surveys, eq(surveys.id, surveySettings.surveyId))
            .where(and(eq(surveySettings.surveyId, input), eq(surveys.tenantId, ctx.tenant)))
            .limit(1);

        return {
            ...(settings || {}),
            allowAnonymous: settings?.allowAnonymous ?? false,
            changePassword: false, // default to false for existing passwords
            closeOnResponseLimit: settings?.closeOnResponseLimit ?? false,
            hasPassword: !!settings?.password,
            isPasswordProtected: settings?.isPasswordProtected ?? false,
            maxResponses: settings?.maxResponses?.toString() ?? '',
            // never return the password
            password: ''
        };
    }),
    updateSettings: protectedProcedure
        .input(z.object({id: z.string(), ...surveySettingsSchema.shape}))
        .mutation(async ({input, ctx}) => {
            const {id, ...settings} = input;
            const survey = await ctx.db
                .select()
                .from(surveys)
                .where(and(eq(surveys.id, id), eq(surveys.tenantId, ctx.tenant)))
                .limit(1);
            if (!survey.length) {
                throw new TRPCError({code: 'NOT_FOUND', message: 'Survey not found'});
            }

            // get current settings to check if password exists
            const [currentSettings] = await ctx.db
                .select({password: surveySettings.password})
                .from(surveySettings)
                .where(eq(surveySettings.surveyId, id))
                .limit(1);

            const hasExistingPassword = !!currentSettings?.password;

            // transform maxResponses from string to number for database storage
            const transformedSettings: any = {
                ...settings,
                maxResponses: settings.maxResponses === '' ? null : Number(settings.maxResponses)
            };

            if (settings.isPasswordProtected) {
                // only hash password if explicitly setting a new one
                if (settings.password && (settings.changePassword || !hasExistingPassword)) {
                    transformedSettings.password = encrypt(settings.password);
                } else if (
                    !settings.password &&
                    (!hasExistingPassword || settings.changePassword)
                ) {
                    // only throw error if no existing password OR user wants to change password but hasn't provided new one
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'You must provide a password when password protection is enabled'
                    });
                } else {
                    // keep existing password hash if not changing
                    delete transformedSettings.password;
                }
            } else {
                // clear password when password protection is disabled
                transformedSettings.password = '';
            }

            if (!transformedSettings.maxResponses) {
                transformedSettings.closeOnResponseLimit = false;
                transformedSettings.closedText = null;
            }

            // remove changePassword from database update
            delete transformedSettings.changePassword;

            const [data] = await ctx.db
                .update(surveySettings)
                .set({...transformNullToUndefined(transformedSettings), updatedAt: new Date()})
                .where(eq(surveySettings.surveyId, id))
                .returning();

            return data;
        })
};
