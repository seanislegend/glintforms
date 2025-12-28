import {
    campaigns,
    questions,
    screeners,
    surveyScreeners,
    surveySettings,
    surveys
} from '@glint/database';
import {encrypt} from '@glint/encryption';
import type {DeleteSurveyDataTaskPayload, GenerateThemesTaskPayload} from '@glint/jobs/schema';
import {tasks} from '@trigger.dev/sdk';
import {TRPCError} from '@trpc/server';
import {and, desc, eq, max, or} from 'drizzle-orm';
import {z} from 'zod';
import {
    assignScreenerSchema,
    removeScreenerSchema,
    updateScreenerFailureMessageSchema,
    updateScreenerOrderSchema
} from '@/lib/schemas/screeners';
import {surveyInsertSchema, surveySettingsSchema, surveyUpdateSchema} from '@/lib/schemas/surveys';
import {surveyCanBeEdited} from '@/lib/surveys/status';
import {transformNullToUndefined} from '@/utils/database';
import {generateSlug} from '@/utils/generate-slug';
import {protectedProcedure, surveyEditableProcedure} from '../init';

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
    update: surveyEditableProcedure
        .input(z.object({surveyId: z.string()}).merge(surveyUpdateSchema))
        .mutation(async ({input, ctx}) => {
            const {surveyId, ...updateData} = input;

            // generate slug from title if title is being updated and slug is not provided
            if (updateData.title && !updateData.slug) {
                updateData.slug = generateSlug(updateData.title);
            }

            const [data] = await ctx.db
                .update(surveys)
                .set({...updateData, updatedAt: new Date()})
                .where(and(eq(surveys.id, surveyId), eq(surveys.tenantId, ctx.tenant)))
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
    updateSettings: surveyEditableProcedure
        .input(z.object({surveyId: z.string(), ...surveySettingsSchema.shape}))
        .mutation(async ({input, ctx}) => {
            const {surveyId, ...settings} = input;

            // get current settings to check if password exists
            const [currentSettings] = await ctx.db
                .select({password: surveySettings.password})
                .from(surveySettings)
                .where(eq(surveySettings.surveyId, surveyId))
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
                .where(eq(surveySettings.surveyId, surveyId))
                .returning();

            return data;
        }),
    getScreeners: protectedProcedure.input(z.string()).query(async ({input: surveyId, ctx}) => {
        const rows = await ctx.db
            .select({
                config: screeners.config,
                createdAt: screeners.createdAt,
                description: screeners.description,
                failureMessage: surveyScreeners.failureMessage,
                id: screeners.id,
                name: screeners.name,
                order: surveyScreeners.order,
                type: screeners.type,
                updatedAt: screeners.updatedAt
            })
            .from(surveyScreeners)
            .innerJoin(screeners, eq(surveyScreeners.screenerId, screeners.id))
            .innerJoin(surveys, eq(surveyScreeners.surveyId, surveys.id))
            .where(
                and(
                    eq(surveyScreeners.surveyId, surveyId),
                    eq(surveys.tenantId, ctx.tenant),
                    eq(screeners.tenantId, ctx.tenant)
                )
            )
            .orderBy(surveyScreeners.order);

        return rows;
    }),
    assignScreener: surveyEditableProcedure
        .input(assignScreenerSchema)
        .mutation(async ({input, ctx}) => {
            // verify survey belongs to tenant and can be edited
            const [survey] = await ctx.db
                .select({id: surveys.id, status: surveys.status})
                .from(surveys)
                .where(and(eq(surveys.id, input.surveyId), eq(surveys.tenantId, ctx.tenant)))
                .limit(1);

            if (!survey) {
                throw new TRPCError({code: 'NOT_FOUND', message: 'Survey not found'});
            }

            if (!surveyCanBeEdited(survey.status)) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Cannot modify survey when it is complete or archived'
                });
            }

            // verify screener belongs to tenant
            const [screener] = await ctx.db
                .select({id: screeners.id})
                .from(screeners)
                .where(
                    and(eq(screeners.id, input.screenerId), eq(screeners.tenantId, ctx.tenant))
                )
                .limit(1);

            if (!screener) {
                throw new TRPCError({code: 'NOT_FOUND', message: 'Screener not found'});
            }

            // check if already assigned
            const [existing] = await ctx.db
                .select()
                .from(surveyScreeners)
                .where(
                    and(
                        eq(surveyScreeners.surveyId, input.surveyId),
                        eq(surveyScreeners.screenerId, input.screenerId)
                    )
                )
                .limit(1);

            if (existing) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Screener is already assigned to this survey'
                });
            }

            // get max order for this survey
            const [maxOrderResult] = await ctx.db
                .select({maxOrder: max(surveyScreeners.order)})
                .from(surveyScreeners)
                .where(eq(surveyScreeners.surveyId, input.surveyId))
                .limit(1);

            const nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

            const [assigned] = await ctx.db
                .insert(surveyScreeners)
                .values({
                    failureMessage: input.failureMessage || null,
                    order: nextOrder,
                    screenerId: input.screenerId,
                    surveyId: input.surveyId
                })
                .returning();

            return assigned;
        }),
    removeScreener: surveyEditableProcedure
        .input(removeScreenerSchema)
        .mutation(async ({input, ctx}) => {
            // verify survey belongs to tenant
            const [survey] = await ctx.db
                .select({id: surveys.id})
                .from(surveys)
                .where(and(eq(surveys.id, input.surveyId), eq(surveys.tenantId, ctx.tenant)))
                .limit(1);

            if (!survey) {
                throw new TRPCError({code: 'NOT_FOUND', message: 'Survey not found'});
            }

            await ctx.db
                .delete(surveyScreeners)
                .where(
                    and(
                        eq(surveyScreeners.surveyId, input.surveyId),
                        eq(surveyScreeners.screenerId, input.screenerId)
                    )
                );

            return {success: true};
        }),
    updateScreenerOrder: surveyEditableProcedure
        .input(updateScreenerOrderSchema)
        .mutation(async ({input, ctx}) => {
            // verify survey belongs to tenant
            const [survey] = await ctx.db
                .select({id: surveys.id})
                .from(surveys)
                .where(and(eq(surveys.id, input.surveyId), eq(surveys.tenantId, ctx.tenant)))
                .limit(1);

            if (!survey) {
                throw new TRPCError({code: 'NOT_FOUND', message: 'Survey not found'});
            }

            const [updated] = await ctx.db
                .update(surveyScreeners)
                .set({order: input.order})
                .where(
                    and(
                        eq(surveyScreeners.surveyId, input.surveyId),
                        eq(surveyScreeners.screenerId, input.screenerId)
                    )
                )
                .returning();

            if (!updated) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Screener assignment not found'
                });
            }

            return updated;
        }),
    updateScreenerFailureMessage: surveyEditableProcedure
        .input(updateScreenerFailureMessageSchema)
        .mutation(async ({input, ctx}) => {
            // verify survey belongs to tenant
            const [survey] = await ctx.db
                .select({id: surveys.id})
                .from(surveys)
                .where(and(eq(surveys.id, input.surveyId), eq(surveys.tenantId, ctx.tenant)))
                .limit(1);

            if (!survey) {
                throw new TRPCError({code: 'NOT_FOUND', message: 'Survey not found'});
            }

            const [updated] = await ctx.db
                .update(surveyScreeners)
                .set({failureMessage: input.failureMessage || null})
                .where(
                    and(
                        eq(surveyScreeners.surveyId, input.surveyId),
                        eq(surveyScreeners.screenerId, input.screenerId)
                    )
                )
                .returning();

            if (!updated) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Screener assignment not found'
                });
            }

            return updated;
        })
};
