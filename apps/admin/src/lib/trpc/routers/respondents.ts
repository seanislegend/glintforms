import {
    authenticityScores,
    campaigns,
    cohorts,
    genderTypes,
    respondentCohorts,
    respondents,
    responses,
    surveys
} from '@glint/database';
import type {SQL} from 'drizzle-orm';
import {and, desc, eq, inArray, ne, notInArray, or, sql} from 'drizzle-orm';
import {z} from 'zod';
import type {RespondentList} from '@/lib/schemas/respondents';
import {protectedProcedure} from '../init';

export const respondentsRouter = {
    getAll: protectedProcedure.query(async ({ctx}) => {
        const rows = await ctx.db
            .select({
                id: respondents.id,
                name: respondents.name,
                email: respondents.email,
                gender: respondents.gender,
                updatedAt: respondents.updatedAt,
                surveyId: surveys.id,
                surveyTitle: surveys.title,
                campaignId: campaigns.id,
                campaignTitle: campaigns.title,
                cohortId: cohorts.id,
                cohortName: cohorts.name
            })
            .from(respondents)
            .leftJoin(responses, eq(respondents.id, responses.respondentId))
            .leftJoin(surveys, eq(responses.surveyId, surveys.id))
            .leftJoin(campaigns, eq(surveys.campaignId, campaigns.id))
            .leftJoin(respondentCohorts, eq(respondents.id, respondentCohorts.respondentId))
            .leftJoin(cohorts, eq(respondentCohorts.cohortId, cohorts.id))
            .where(eq(respondents.tenantId, ctx.tenant))
            .orderBy(desc(respondents.updatedAt));

        const data = Object.values(
            rows.reduce(
                (acc, row) => {
                    if (!acc[row.id]) {
                        acc[row.id] = {...row, surveys: [], cohorts: []};
                    }
                    if (row.surveyId && acc[row.id] && acc[row.id]?.surveys) {
                        const respondent = acc[row.id];
                        if (!respondent || !respondent.surveys) return acc;

                        const hasSurvey = respondent.surveys.some(
                            (s: {id: string}) => s.id === row.surveyId
                        );
                        if (!hasSurvey) {
                            respondent.surveys.push({
                                id: row.surveyId,
                                title: row.surveyTitle ?? '',
                                campaignId: row.campaignId,
                                campaignTitle: row.campaignTitle
                            });
                        }
                    }
                    if (row.cohortId && acc[row.id] && acc[row.id]?.cohorts) {
                        const respondent = acc[row.id];
                        if (!respondent || !respondent.cohorts) return acc;

                        const hasCohort = respondent.cohorts.some(
                            (c: {id: string}) => c.id === row.cohortId
                        );
                        if (!hasCohort) {
                            respondent.cohorts.push({
                                id: row.cohortId,
                                name: row.cohortName ?? ''
                            });
                        }
                    }
                    return acc;
                },
                {} as Record<string, RespondentList>
            )
        );

        return data;
    }),
    get: protectedProcedure.input(z.string()).query(async ({input, ctx}) => {
        const [data] = await ctx.db
            .select()
            .from(respondents)
            .where(and(eq(respondents.id, input), eq(respondents.tenantId, ctx.tenant)))
            .limit(1);
        if (!data) return null;

        const cohortAssignments = await ctx.db
            .select({cohortId: respondentCohorts.cohortId})
            .from(respondentCohorts)
            .where(eq(respondentCohorts.respondentId, input));

        return {
            ...data,
            cohortIds: cohortAssignments.map(c => c.cohortId)
        };
    }),
    getProfile: protectedProcedure.input(z.string()).query(async ({input: respondentId, ctx}) => {
        const [respondentData] = await ctx.db
            .select()
            .from(respondents)
            .where(and(eq(respondents.id, respondentId), eq(respondents.tenantId, ctx.tenant)))
            .limit(1);
        const respondent = respondentData;
        if (!respondent) return null;

        const surveysData = await ctx.db
            .select({
                id: surveys.id,
                title: surveys.title,
                responseCount: sql<number>`count(${responses.id})`,
                campaignId: campaigns.id,
                campaignTitle: campaigns.title,
                campaignDescription: campaigns.description,
                campaignIsActive: campaigns.isActive,
                campaignCreatedAt: campaigns.createdAt
            })
            .from(surveys)
            .innerJoin(responses, eq(surveys.id, responses.surveyId))
            .leftJoin(campaigns, eq(surveys.campaignId, campaigns.id))
            .where(eq(responses.respondentId, respondentId))
            .groupBy(
                surveys.id,
                surveys.title,
                campaigns.id,
                campaigns.title,
                campaigns.description,
                campaigns.isActive,
                campaigns.createdAt
            );
        const cohortsData = await ctx.db
            .select({
                id: cohorts.id,
                name: cohorts.name,
                description: cohorts.description,
                assignedAt: respondentCohorts.assignedAt
            })
            .from(respondentCohorts)
            .innerJoin(cohorts, eq(respondentCohorts.cohortId, cohorts.id))
            .where(eq(respondentCohorts.respondentId, respondentId));
        const [authenticityData] = await ctx.db
            .select({
                avgScore: sql<number>`avg(${authenticityScores.percentage})`,
                totalResponses: sql<number>`count(${authenticityScores.id})`
            })
            .from(authenticityScores)
            .innerJoin(responses, eq(authenticityScores.responseId, responses.id))
            .where(eq(responses.respondentId, respondentId));
        const avgAuthenticityScore = authenticityData?.avgScore || 0;
        const totalResponsesWithScores = authenticityData?.totalResponses || 0;

        return {
            ...respondent,
            cohorts: cohortsData,
            surveys: surveysData,
            avgAuthenticityScore: Math.round(avgAuthenticityScore),
            totalResponsesWithScores
        };
    }),
    create: protectedProcedure
        .input(
            z.object({
                email: z.string().email(),
                name: z.string().min(1),
                notes: z.string().optional(),
                signupSource: z.string().optional()
            })
        )
        .mutation(async ({input, ctx}) => {
            const [newRespondent] = await ctx.db
                .insert(respondents)
                .values({
                    email: input.email,
                    name: input.name,
                    notes: input.notes,
                    signupSource: input.signupSource,
                    tenantId: ctx.tenant
                })
                .returning();
            return newRespondent;
        }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                email: z.string().email().optional(),
                name: z.string().min(1).optional(),
                notes: z.string().optional(),
                signupSource: z.string().optional(),
                cohortIds: z.array(z.string()).optional()
            })
        )
        .mutation(async ({input, ctx}) => {
            const {id, cohortIds, ...updateData} = input;

            const [updatedRespondent] = await ctx.db
                .update(respondents)
                .set(updateData)
                .where(and(eq(respondents.id, id), eq(respondents.tenantId, ctx.tenant)))
                .returning();

            if (cohortIds !== undefined) {
                await ctx.db
                    .delete(respondentCohorts)
                    .where(eq(respondentCohorts.respondentId, id));

                if (cohortIds.length > 0) {
                    await ctx.db.insert(respondentCohorts).values(
                        cohortIds.map(cohortId => ({
                            respondentId: id,
                            cohortId,
                            assignedBy: ctx.user.id
                        }))
                    );
                }
            }

            return updatedRespondent;
        }),
    getFilterValues: protectedProcedure.query(async ({ctx}) => {
        const genderRows = await ctx.db
            .select({value: respondents.gender})
            .from(respondents)
            .where(
                and(eq(respondents.tenantId, ctx.tenant), sql`${respondents.gender} IS NOT NULL`)
            )
            .groupBy(respondents.gender);
        const genders = genderRows
            .map(r => r.value)
            .filter((g): g is NonNullable<typeof g> => g !== null);
        const cities = await ctx.db
            .select({value: respondents.locationCity})
            .from(respondents)
            .where(
                and(
                    eq(respondents.tenantId, ctx.tenant),
                    sql`${respondents.locationCity} IS NOT NULL`
                )
            )
            .groupBy(respondents.locationCity);
        const countries = await ctx.db
            .select({value: respondents.locationCountry})
            .from(respondents)
            .where(
                and(
                    eq(respondents.tenantId, ctx.tenant),
                    sql`${respondents.locationCountry} IS NOT NULL`
                )
            )
            .groupBy(respondents.locationCountry);
        const surveyData = await ctx.db
            .select({
                id: surveys.id,
                title: surveys.title
            })
            .from(surveys)
            .innerJoin(responses, eq(surveys.id, responses.surveyId))
            .innerJoin(respondents, eq(responses.respondentId, respondents.id))
            .where(eq(surveys.tenantId, ctx.tenant))
            .groupBy(surveys.id, surveys.title);
        const allRespondents = await ctx.db
            .select({metadata: respondents.metadata})
            .from(respondents)
            .where(eq(respondents.tenantId, ctx.tenant));
        const ages = Array.from(
            new Set(
                allRespondents
                    .map(r => {
                        const metadata = r.metadata as {age?: number | string} | null;
                        return metadata?.age ? String(metadata.age) : null;
                    })
                    .filter((age): age is string => age !== null)
            )
        ).sort((a, b) => Number(a) - Number(b));

        return {
            ages: ages.map(age => ({label: age, value: age})),
            cities: cities
                .map(c => c.value)
                .filter((city): city is string => city !== null)
                .sort()
                .map(city => ({label: city, value: city})),
            countries: countries
                .map(c => c.value)
                .filter((country): country is string => country !== null)
                .sort()
                .map(country => ({label: country, value: country})),
            genders: genders.sort().map(gender => ({label: String(gender), value: String(gender)})),
            surveys: surveyData
                .map(s => ({id: s.id, title: s.title}))
                .filter((s): s is {id: string; title: string} => Boolean(s.id && s.title))
                .sort((a, b) => a.title.localeCompare(b.title))
                .map(s => ({label: s.title, value: s.id}))
        };
    }),
    search: protectedProcedure
        .input(
            z.object({
                age: z
                    .object({
                        max: z.string().optional(),
                        min: z.string().optional(),
                        type: z
                            .union([z.enum(['equal', 'between', 'over', 'under']), z.literal('')])
                            .optional(),
                        value: z.string().optional()
                    })
                    .optional(),
                excludeCohortId: z.string().uuid().optional(),
                gender: z
                    .array(
                        z.object({qualifier: z.enum(['is', 'is_not']), value: z.enum(genderTypes)})
                    )
                    .optional(),
                locationCity: z
                    .array(z.object({qualifier: z.enum(['is', 'is_not']), value: z.string()}))
                    .optional(),
                locationCountry: z
                    .array(z.object({qualifier: z.enum(['is', 'is_not']), value: z.string()}))
                    .optional(),
                survey: z
                    .array(z.object({qualifier: z.enum(['is', 'is_not']), value: z.string()}))
                    .optional()
            })
        )
        .mutation(async ({ctx, input}) => {
            const conditions = [eq(respondents.tenantId, ctx.tenant)];
            const appendOr = (clauses: Array<SQL<unknown> | null | undefined>) => {
                let combined: SQL<unknown> | undefined;
                const isSql = (clause: SQL<unknown> | null | undefined): clause is SQL<unknown> =>
                    clause !== null && clause !== undefined;
                clauses.forEach(clause => {
                    if (!isSql(clause)) return;
                    if (combined === undefined) {
                        combined = clause;
                    } else {
                        combined = or(combined, clause);
                    }
                });
                if (combined !== undefined) {
                    conditions.push(combined);
                }
            };

            // exclude respondents already in the cohort if excludeCohortId is provided
            if (input.excludeCohortId) {
                const respondentsInCohort = await ctx.db
                    .select({respondentId: respondentCohorts.respondentId})
                    .from(respondentCohorts)
                    .where(eq(respondentCohorts.cohortId, input.excludeCohortId));

                const respondentIdsInCohort = respondentsInCohort
                    .map(r => r.respondentId)
                    .filter((id): id is string => id !== null);

                if (respondentIdsInCohort.length > 0) {
                    conditions.push(notInArray(respondents.id, respondentIdsInCohort));
                }
            }

            if (input.gender && input.gender.length > 0) {
                const genderConditions = input.gender.map(entry => {
                    if (entry.qualifier === 'is') {
                        return eq(respondents.gender, entry.value);
                    }
                    return ne(respondents.gender, entry.value);
                });
                appendOr(genderConditions);
            }

            if (input.locationCity && input.locationCity.length > 0) {
                const cityConditions = input.locationCity.map(entry => {
                    if (entry.qualifier === 'is') {
                        return eq(respondents.locationCity, entry.value);
                    }
                    return ne(respondents.locationCity, entry.value);
                });
                appendOr(cityConditions);
            }

            if (input.locationCountry && input.locationCountry.length > 0) {
                const countryConditions = input.locationCountry.map(entry => {
                    if (entry.qualifier === 'is') {
                        return eq(respondents.locationCountry, entry.value);
                    }
                    return ne(respondents.locationCountry, entry.value);
                });
                appendOr(countryConditions);
            }

            if (input.survey && input.survey.length > 0) {
                const surveyResults = await Promise.all(
                    input.survey.map(async entry => {
                        const respondentIdsWithSurvey = await ctx.db
                            .selectDistinct({respondentId: responses.respondentId})
                            .from(responses)
                            .where(
                                and(
                                    eq(responses.surveyId, entry.value),
                                    eq(responses.tenantId, ctx.tenant)
                                )
                            );

                        const ids = respondentIdsWithSurvey
                            .map(r => r.respondentId)
                            .filter((id): id is string => id !== null);

                        return {condition: entry, ids};
                    })
                );

                const hasIsWithNoResults = surveyResults.some(
                    result => result.condition.qualifier === 'is' && result.ids.length === 0
                );

                if (hasIsWithNoResults) {
                    return [];
                }

                const surveyConditions = surveyResults
                    .map(result => {
                        if (result.ids.length > 0) {
                            if (result.condition.qualifier === 'is') {
                                return inArray(respondents.id, result.ids);
                            }
                            return notInArray(respondents.id, result.ids);
                        }
                        if (result.condition.qualifier === 'is_not') {
                            return sql`true`;
                        }
                        return null;
                    })
                    .filter((c): c is NonNullable<typeof c> => c !== null);

                appendOr(surveyConditions);
            }

            const ageType = input.age?.type === '' ? null : input.age?.type;
            if (ageType) {
                const ageValue = input.age?.value ? Number(input.age.value) : null;
                const ageMin = input.age?.min ? Number(input.age.min) : null;
                const ageMax = input.age?.max ? Number(input.age.max) : null;

                if (ageType === 'equal' && ageValue !== null) {
                    const clause = and(
                        sql`${respondents.metadata}->>'age' IS NOT NULL`,
                        sql`CAST(${respondents.metadata}->>'age' AS INTEGER) = ${ageValue}`
                    );
                    if (clause) conditions.push(clause);
                } else if (ageType === 'over' && ageValue !== null) {
                    const clause = and(
                        sql`${respondents.metadata}->>'age' IS NOT NULL`,
                        sql`CAST(${respondents.metadata}->>'age' AS INTEGER) > ${ageValue}`
                    );
                    if (clause) conditions.push(clause);
                } else if (ageType === 'under' && ageValue !== null) {
                    const clause = and(
                        sql`${respondents.metadata}->>'age' IS NOT NULL`,
                        sql`CAST(${respondents.metadata}->>'age' AS INTEGER) < ${ageValue}`
                    );
                    if (clause) conditions.push(clause);
                } else if (ageType === 'between' && ageMin !== null && ageMax !== null) {
                    const clause = and(
                        sql`${respondents.metadata}->>'age' IS NOT NULL`,
                        sql`CAST(${respondents.metadata}->>'age' AS INTEGER) >= ${ageMin}`,
                        sql`CAST(${respondents.metadata}->>'age' AS INTEGER) <= ${ageMax}`
                    );
                    if (clause) conditions.push(clause);
                }
            }

            const results = await ctx.db
                .select({
                    email: respondents.email,
                    gender: respondents.gender,
                    id: respondents.id,
                    locationCity: respondents.locationCity,
                    locationCountry: respondents.locationCountry,
                    name: respondents.name
                })
                .from(respondents)
                .where(and(...conditions));

            return results;
        })
};
