import {activities, questions, surveys} from '@glint/database';
import {and, asc, eq, inArray} from 'drizzle-orm';
import {z} from 'zod';
import {generateQuestions} from '@/lib/question-generation-service';
import {questionSchema, questionsUpdateSchema} from '@/lib/schemas/questions';
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

        // save questions to db, if question already exists, update it
        await ctx.db.transaction(async tx => {
            // delete removed questions first
            if (input.deletedQuestionIds && Object.keys(input.deletedQuestionIds).length > 0) {
                await tx
                    .delete(questions)
                    .where(
                        eq(questions.surveyId, surveyId) &&
                            inArray(questions.id, Object.keys(input.deletedQuestionIds))
                    );
            }

            // insert/update remaining questions
            for (const q of input.questions) {
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

            return generateQuestions({
                questionCount: input.questionCount,
                topic: input.topic,
                description: input.description,
                existingQuestions: input.existingQuestions,
                surveyId: input.surveyId
            });
        })
};
