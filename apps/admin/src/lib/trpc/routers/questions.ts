import {activities, questions, surveys} from '@glint/database';
import {and, asc, eq, inArray} from 'drizzle-orm';
import {z} from 'zod';
import {questionSchema, questionsUpdateSchema} from '@/lib/schemas/questions';
import {generateQuestions} from '@/lib/surveys/question-generation-service';
import {hasPublishedStructureChanges} from '@/lib/surveys/validate-published-structure';
import {protectedProcedure} from '../init';

export const questionsRouter = {
    getAll: protectedProcedure.input(z.string()).query(async ({input, ctx}) => {
        const data = await ctx.db
            .select({
                allowOther: questions.allowOther,
                description: questions.description,
                id: questions.id,
                options: questions.options,
                order: questions.order,
                randomiseOptionsOrder: questions.randomiseOptionsOrder,
                required: questions.required,
                surveyId: questions.surveyId,
                title: questions.title,
                type: questions.type,
                validations: questions.validations
            })
            .from(questions)
            .where(eq(questions.surveyId, input))
            .orderBy(asc(questions.order));

        return data;
    }),
    update: protectedProcedure.input(questionsUpdateSchema).mutation(async ({input, ctx}) => {
        const surveyId = input.surveyId;
        if (!surveyId) {
            return {success: false, error: 'Survey id is required'};
        }

        // verify survey belongs to tenant
        const [survey] = await ctx.db
            .select()
            .from(surveys)
            .where(and(eq(surveys.id, surveyId), eq(surveys.tenantId, ctx.tenant)));
        if (!survey) {
            return {success: false, error: 'Survey not found or access denied'};
        }

        const isDraft = survey.status === 'draft';

        // get existing questions for validation and updates (needed for non-draft surveys)
        let existingQuestionsMap:
            | Map<
                  string,
                  {
                      description: string | null;
                      metadata: unknown;
                      options: unknown;
                      title: string;
                      type: string;
                  }
              >
            | undefined;

        if (!isDraft) {
            // get existing questions to compare
            const existingQuestions = await ctx.db
                .select({
                    description: questions.description,
                    id: questions.id,
                    metadata: questions.metadata,
                    options: questions.options,
                    title: questions.title,
                    type: questions.type
                })
                .from(questions)
                .where(eq(questions.surveyId, surveyId));

            existingQuestionsMap = new Map(
                existingQuestions.map(q => [
                    q.id,
                    {
                        description: q.description,
                        metadata: q.metadata,
                        options: q.options,
                        title: q.title,
                        type: q.type
                    }
                ])
            );
        }

        // if not draft, validate that no structural changes are being made
        if (!isDraft && existingQuestionsMap) {
            const structureError = hasPublishedStructureChanges({
                existingQuestionsMap,
                deletedQuestionIds: input.deletedQuestionIds ?? {},
                questions: input.questions
            });
            if (structureError) {
                return {success: false, error: structureError};
            }
        }

        // save questions to db, if question already exists, update it
        await ctx.db.transaction(async tx => {
            // delete removed questions first (only if draft)
            if (
                isDraft &&
                input.deletedQuestionIds &&
                Object.keys(input.deletedQuestionIds).length > 0
            ) {
                await tx
                    .delete(questions)
                    .where(
                        eq(questions.surveyId, surveyId) &&
                            inArray(questions.id, Object.keys(input.deletedQuestionIds))
                    );
            }

            // insert/update remaining questions
            for (const q of input.questions) {
                if (isDraft) {
                    // full update allowed for draft surveys
                    await tx
                        .insert(questions)
                        .values(q)
                        .onConflictDoUpdate({
                            target: [questions.id],
                            set: {
                                allowOther: q.allowOther,
                                description: q.description,
                                options: q.options,
                                order: q.order,
                                randomiseOptionsOrder: q.randomiseOptionsOrder,
                                required: q.required,
                                title: q.title,
                                type: q.type,
                                validations: q.validations
                            }
                        });
                } else {
                    // only allow updating copy (title, description) and option values for non-draft surveys
                    const existing = existingQuestionsMap
                        ? existingQuestionsMap.get(q.id)
                        : undefined;

                    if (existing) {
                        // preserve existing options structure but allow value updates
                        const existingOptions = Array.isArray(existing.options)
                            ? existing.options
                            : [];
                        const newOptions = Array.isArray(q.options) ? q.options : [];
                        const updatedOptions = existingOptions.map(
                            (existingOpt: any, idx: number) => {
                                const newOpt = newOptions[idx];
                                return newOpt ? {...existingOpt, value: newOpt.value} : existingOpt;
                            }
                        );

                        const hasDescriptionChange = existing.description !== q.description;
                        const hasOptionValueChanges = updatedOptions.some(
                            (updatedOpt: any, idx: number) => {
                                const currentOpt = existingOptions[idx] as any;
                                return currentOpt?.value !== updatedOpt?.value;
                            }
                        );
                        const hasTitleChange = existing.title !== q.title;
                        const hasChanges =
                            hasDescriptionChange || hasOptionValueChanges || hasTitleChange;

                        const existingMetadata =
                            (existing.metadata as Record<string, unknown>) ?? {};
                        const currentVersion =
                            typeof existingMetadata.version === 'number' &&
                            existingMetadata.version > 0
                                ? existingMetadata.version
                                : 1;
                        const nextVersion = hasChanges ? currentVersion + 1 : currentVersion;
                        const existingVersions =
                            (existingMetadata.versions as {
                                description?: QuestionMetadataVersions;
                                options?: {
                                    [optionId: string]: QuestionMetadataVersions;
                                };
                                title?: QuestionMetadataVersions;
                            }) ?? {};
                        const nextVersions = {...existingVersions};
                        const now = new Date();
                        const versionKey = String(nextVersion);

                        if (hasTitleChange) {
                            const titleVersions = existingVersions.title ?? {};
                            nextVersions.title = {
                                ...titleVersions,
                                [versionKey]: {
                                    updatedAt: now,
                                    value: q.title
                                }
                            };
                        }

                        if (hasDescriptionChange) {
                            const descriptionVersions = existingVersions.description ?? {};
                            nextVersions.description = {
                                ...descriptionVersions,
                                [versionKey]: {
                                    updatedAt: now,
                                    value: q.description ?? ''
                                }
                            };
                        }

                        if (hasOptionValueChanges) {
                            const optionVersions = existingVersions.options ?? {};
                            updatedOptions.forEach((updatedOpt: any, idx: number) => {
                                const currentOpt = existingOptions[idx] as any;
                                if (currentOpt?.value !== updatedOpt?.value) {
                                    const existingOptionVersions =
                                        optionVersions[updatedOpt.id] ?? {};
                                    optionVersions[updatedOpt.id] = {
                                        ...existingOptionVersions,
                                        [versionKey]: {
                                            updatedAt: now,
                                            value: updatedOpt.value
                                        }
                                    };
                                }
                            });
                            nextVersions.options = optionVersions;
                        }

                        const nextMetadata = {
                            ...existingMetadata,
                            optionValues: Object.fromEntries(
                                updatedOptions.map((opt: any) => [opt.id, opt.value])
                            ),
                            version: nextVersion,
                            versions: nextVersions
                        };

                        await tx
                            .update(questions)
                            .set({
                                description: q.description,
                                metadata: nextMetadata,
                                options: updatedOptions,
                                title: q.title
                                // note: not updating allowOther, required, randomiseOptionsOrder, type, validations
                                // as these are structural changes not allowed for non-draft surveys
                            })
                            .where(eq(questions.id, q.id));
                    }
                }
            }

            await tx.insert(activities).values({
                details: {surveyTitle: survey?.title ?? 'Unknown'},
                surveyId,
                tenantId: ctx.tenant,
                text: `Updated questions`,
                type: 'updated',
                userId: ctx.user.id
            });

            if (survey?.hasResponses) {
                await tx.update(surveys).set({hasResponses: true}).where(eq(surveys.id, surveyId));
            }
        });

        return {success: true};
    }),
    generate: protectedProcedure
        .input(
            z.object({
                description: z.string().optional(),
                existingQuestions: z.array(questionSchema).optional(),
                questionCount: z.number().min(1).max(10),
                surveyId: z.string(),
                topic: z.string().optional()
            })
        )
        .mutation(async ({input, ctx}) => {
            const [survey] = await ctx.db
                .select()
                .from(surveys)
                .where(and(eq(surveys.id, input.surveyId), eq(surveys.tenantId, ctx.tenant)));
            if (!survey) {
                throw new Error('Survey not found or access denied');
            }

            if (survey.status !== 'draft') {
                throw new Error(
                    'Cannot generate questions for a survey that is no longer in draft status'
                );
            }

            return generateQuestions({
                questionCount: input.questionCount,
                topic: input.topic,
                description: input.description,
                existingQuestions: input.existingQuestions,
                surveyId: input.surveyId
            });
        })
};
