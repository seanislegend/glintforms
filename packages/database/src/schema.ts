import {relations} from 'drizzle-orm';
import {
    boolean,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar
} from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', {length: 255}).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// better-auth tables
export const user = pgTable('user', {
    createdAt: timestamp('created_at')
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified')
        .$defaultFn(() => false)
        .notNull(),
    id: text('id').primaryKey(),
    image: text('image'),
    name: text('name').notNull(),
    tenantId: uuid('tenant_id').references(() => tenants.id, {onDelete: 'cascade'}),
    updatedAt: timestamp('updated_at')
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull()
});
export const session = pgTable('session', {
    createdAt: timestamp('created_at').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    id: text('id').primaryKey(),
    ipAddress: text('ip_address'),
    token: text('token').notNull().unique(),
    updatedAt: timestamp('updated_at').notNull(),
    userAgent: text('user_agent'),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, {onDelete: 'cascade'})
});
export const account = pgTable('account', {
    accessToken: text('access_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    accountId: text('account_id').notNull(),
    createdAt: timestamp('created_at').notNull(),
    id: text('id').primaryKey(),
    providerId: text('provider_id').notNull(),
    idToken: text('id_token'),
    password: text('password'),
    refreshToken: text('refresh_token'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    updatedAt: timestamp('updated_at').notNull(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, {onDelete: 'cascade'})
});
export const verification = pgTable('verification', {
    createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    identifier: text('identifier').notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()),
    value: text('value').notNull()
});

export const campaigns = pgTable('campaigns', {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    id: uuid('id').primaryKey().defaultRandom(),
    isActive: boolean('is_active').default(true).notNull(),
    tenantId: uuid('tenant_id')
        .references(() => tenants.id, {onDelete: 'cascade'})
        .notNull(),
    title: varchar('title', {length: 255}).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const surveyStatuses = ['draft', 'testing', 'active', 'complete', 'archived'] as const;
export const surveyStatusEnum = pgEnum('survey_status', surveyStatuses);
export const surveys = pgTable(
    'surveys',
    {
        archivedAt: timestamp('archived_at'),
        campaignId: uuid('campaign_id')
            .references(() => campaigns.id, {onDelete: 'cascade'})
            .notNull(),
        completedAt: timestamp('completed_at'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        description: text('description'),
        hasResponses: boolean('has_responses').default(false).notNull(),
        id: uuid('id').primaryKey().defaultRandom(),
        launchedAt: timestamp('launched_at'),
        settings: jsonb('settings'),
        slug: varchar('slug', {length: 255}).notNull().unique(),
        status: surveyStatusEnum('status').notNull().default('draft'),
        tenantId: uuid('tenant_id')
            .references(() => tenants.id, {onDelete: 'cascade'})
            .notNull(),
        testedAt: timestamp('tested_at'),
        title: varchar('title', {length: 255}).notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull()
    },
    table => ({
        campaignIdx: index('campaign_idx').on(table.campaignId),
        slugIdx: index('slug_idx').on(table.slug),
        statusIdx: index('status_idx').on(table.status),
        tenantIdx: index('tenant_idx').on(table.tenantId)
    })
);

export const genderTypes = ['female', 'male', 'other', 'prefer_not_to_say'] as const;
export const genderEnum = pgEnum('gender', genderTypes);

export const respondents = pgTable(
    'respondents',
    {
        createdAt: timestamp('created_at').defaultNow().notNull(),
        email: text('email').notNull(),
        gender: genderEnum('gender'),
        id: uuid('id').primaryKey().defaultRandom(),
        locationCity: text('location_city'),
        locationCountry: text('location_country'),
        // flexible field for storing additional data
        metadata: jsonb('metadata'),
        name: text('name').notNull(),
        notes: text('notes'),
        signupSource: text('signup_source'),
        tenantId: uuid('tenant_id')
            .references(() => tenants.id, {onDelete: 'cascade'})
            .notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull()
    },
    table => ({
        emailTenantIdx: index('respondent_email_tenant_idx').on(table.email, table.tenantId),
        signupSourceIdx: index('respondent_signup_source_idx').on(table.signupSource),
        tenantIdx: index('respondent_tenant_idx').on(table.tenantId)
    })
);

export const cohorts = pgTable(
    'cohorts',
    {
        createdAt: timestamp('created_at').defaultNow().notNull(),
        description: text('description'),
        id: uuid('id').primaryKey().defaultRandom(),
        name: varchar('name', {length: 255}).notNull(),
        tenantId: uuid('tenant_id')
            .references(() => tenants.id, {onDelete: 'cascade'})
            .notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull()
    },
    table => ({
        tenantIdx: index('cohort_tenant_idx').on(table.tenantId)
    })
);

export const respondentCohorts = pgTable(
    'respondent_cohorts',
    {
        assignedAt: timestamp('assigned_at').defaultNow().notNull(),
        assignedBy: text('assigned_by').references(() => user.id),
        cohortId: uuid('cohort_id')
            .references(() => cohorts.id, {onDelete: 'cascade'})
            .notNull(),
        respondentId: uuid('respondent_id')
            .references(() => respondents.id, {onDelete: 'cascade'})
            .notNull()
    },
    table => ({
        cohortIdx: index('respondent_cohort_cohort_idx').on(table.cohortId),
        respondentIdx: index('respondent_cohort_respondent_idx').on(table.respondentId),
        primaryKey: index('respondent_cohort_pk').on(table.respondentId, table.cohortId)
    })
);

export const surveySettings = pgTable('survey_settings', {
    allowAnonymous: boolean('allow_anonymous').notNull().default(true),
    closeOnResponseLimit: boolean('close_on_response_limit').notNull().default(false),
    closedText: text('closed_text'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    isPasswordProtected: boolean('is_password_protected').notNull().default(false),
    maxResponses: integer('max_responses'),
    password: text('password'),
    surveyId: uuid('survey_id')
        .references(() => surveys.id, {onDelete: 'cascade'})
        .notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const answers = pgTable(
    'answers',
    {
        createdAt: timestamp('created_at').defaultNow().notNull(),
        endedAt: timestamp('ended_at'),
        id: uuid('id').primaryKey().defaultRandom(),
        questionId: uuid('question_id')
            .references(() => questions.id, {onDelete: 'cascade'})
            .notNull(),
        responseId: uuid('response_id')
            .references(() => responses.id, {onDelete: 'cascade'})
            .notNull(),
        startedAt: timestamp('started_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
        value: jsonb('value'),
        wasSkipped: boolean('was_skipped').default(false).notNull()
    },
    table => ({
        questionIdx: index('answer_question_idx').on(table.questionId),
        responseIdx: index('answer_response_idx').on(table.responseId)
    })
);

export const authenticityScores = pgTable(
    'authenticity_scores',
    {
        createdAt: timestamp('created_at').defaultNow().notNull(),
        id: uuid('id').primaryKey().defaultRandom(),
        isOverridden: boolean('is_overridden').default(false).notNull(),
        metadata: jsonb('metadata'),
        overrideOriginalPercentage: integer('override_original_percentage'),
        overrideReason: text('override_reason'),
        overrideUserId: text('override_user_id').references(() => user.id),
        overrideTimestamp: timestamp('override_timestamp'),
        percentage: integer('percentage').notNull(),
        responseId: uuid('response_id')
            .references(() => responses.id, {onDelete: 'cascade'})
            .notNull(),
        surveyId: uuid('survey_id')
            .references(() => surveys.id, {onDelete: 'cascade'})
            .notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull()
    },
    table => ({
        responseIdx: index('authenticity_response_idx').on(table.responseId),
        surveyIdx: index('authenticity_survey_idx').on(table.surveyId)
    })
);

export const questions = pgTable(
    'questions',
    {
        allowOther: boolean('allow_other').default(false).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        description: text('description'),
        id: uuid('id').primaryKey().defaultRandom(),
        metadata: jsonb('metadata'),
        options: jsonb('options'),
        order: integer('order').default(0).notNull(),
        randomiseOptionsOrder: boolean('randomise_order').default(false).notNull(),
        required: boolean('required').default(true).notNull(),
        surveyId: uuid('survey_id')
            .references(() => surveys.id, {onDelete: 'cascade'})
            .notNull(),
        title: varchar('title', {length: 500}).notNull(),
        type: varchar('type', {length: 50}).notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
        validations: jsonb('validations').default('[]')
    },
    table => ({
        surveyIdx: index('survey_idx').on(table.surveyId),
        typeIdx: index('type_idx').on(table.type)
    })
);

export const activityTypes = [
    'archived',
    'completed',
    'created',
    'deleted',
    'generic',
    'launched',
    'respondes_recorded',
    'settings_updated',
    'status_changed',
    'tested',
    'updated'
] as const;
export const activityTypeEnum = pgEnum('activity_type', activityTypes);
export const activities = pgTable(
    'activities',
    {
        createdAt: timestamp('created_at').defaultNow().notNull(),
        details: jsonb('details'),
        id: uuid('id').primaryKey().defaultRandom(),
        metadata: jsonb('metadata'),
        surveyId: uuid('survey_id').references(() => surveys.id, {onDelete: 'cascade'}),
        tenantId: uuid('tenant_id')
            .references(() => tenants.id, {onDelete: 'cascade'})
            .notNull(),
        text: text('text'),
        type: activityTypeEnum('type').notNull(),
        userId: text('user_id').references(() => user.id, {onDelete: 'cascade'})
    },
    table => ({
        createdAtIdx: index('activity_created_at_idx').on(table.createdAt),
        surveyIdx: index('activity_survey_idx').on(table.surveyId),
        tenantIdx: index('activity_tenant_idx').on(table.tenantId),
        typeIdx: index('activity_type_idx').on(table.type),
        userIdx: index('activity_user_idx').on(table.userId)
    })
);

export const responses = pgTable(
    'responses',
    {
        createdAt: timestamp('created_at').defaultNow().notNull(),
        endedAt: timestamp('ended_at'),
        geolocation: jsonb('geolocation'),
        id: uuid('id').primaryKey().defaultRandom(),
        // flexible field for storing response-specific data
        metadata: jsonb('metadata'),
        respondentId: uuid('respondent_id').references(() => respondents.id, {
            onDelete: 'set null'
        }),
        startedAt: timestamp('started_at').defaultNow().notNull(),
        surveyId: uuid('survey_id')
            .references(() => surveys.id, {onDelete: 'cascade'})
            .notNull(),
        tenantId: uuid('tenant_id')
            .references(() => tenants.id, {onDelete: 'cascade'})
            .notNull(),
        wasCompleted: boolean('was_completed').default(false).notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull()
    },
    table => ({
        respondentIdx: index('response_respondent_idx').on(table.respondentId),
        surveyIdx: index('response_survey_idx').on(table.surveyId),
        surveyTenantIdx: index('response_survey_tenant_idx').on(table.surveyId, table.tenantId),
        tenantIdx: index('response_tenant_idx').on(table.tenantId)
    })
);

export const analysisThemes = pgTable(
    'analysis_themes',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
        questionId: uuid('question_id')
            .references(() => questions.id, {onDelete: 'cascade'})
            .notNull(),
        name: varchar('name', {length: 255}).notNull(),
        description: text('description'),
        sentiment: varchar('sentiment', {length: 50}),
        score: integer('score').default(0).notNull(),
        metadata: jsonb('metadata')
    },
    table => ({
        questionIdx: index('analysis_theme_question_idx').on(table.questionId)
    })
);

export const analysisThemeEntries = pgTable(
    'analysis_theme_entries',
    {
        themeId: uuid('theme_id')
            .references(() => analysisThemes.id, {onDelete: 'cascade'})
            .notNull(),
        answerId: uuid('answer_id')
            .references(() => answers.id, {onDelete: 'cascade'})
            .notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull()
    },
    table => ({
        themeIdx: index('entry_theme_idx').on(table.themeId),
        answerIdx: index('entry_answer_idx').on(table.answerId)
    })
);

// relations

export const answersRelations = relations(answers, ({one, many}) => ({
    question: one(questions, {
        fields: [answers.questionId],
        references: [questions.id]
    }),
    response: one(responses, {
        fields: [answers.responseId],
        references: [responses.id]
    }),
    themeEntries: many(analysisThemeEntries)
}));

export const surveySettingsRelations = relations(surveySettings, ({one}) => ({
    survey: one(surveys, {
        fields: [surveySettings.surveyId],
        references: [surveys.id]
    })
}));

export const tenantsRelations = relations(tenants, ({many}) => ({
    activities: many(activities),
    campaigns: many(campaigns),
    cohorts: many(cohorts),
    responses: many(responses),
    respondents: many(respondents),
    surveys: many(surveys),
    users: many(user)
}));

export const userRelations = relations(user, ({one, many}) => ({
    accounts: many(account),
    activities: many(activities),
    authenticityScores: many(authenticityScores),
    respondentCohorts: many(respondentCohorts),
    sessions: many(session),
    tenant: one(tenants, {
        fields: [user.tenantId],
        references: [tenants.id]
    })
}));

export const sessionRelations = relations(session, ({one}) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id]
    })
}));

export const accountRelations = relations(account, ({one}) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id]
    })
}));

export const campaignsRelations = relations(campaigns, ({one, many}) => ({
    authenticityScores: many(authenticityScores),
    surveys: many(surveys),
    tenant: one(tenants, {
        fields: [campaigns.tenantId],
        references: [tenants.id]
    })
}));

export const surveysRelations = relations(surveys, ({one, many}) => ({
    activities: many(activities),
    authenticityScores: many(authenticityScores),
    campaign: one(campaigns, {
        fields: [surveys.campaignId],
        references: [campaigns.id]
    }),
    questions: many(questions),
    responses: many(responses),
    tenant: one(tenants, {
        fields: [surveys.tenantId],
        references: [tenants.id]
    })
}));

export const questionsRelations = relations(questions, ({one, many}) => ({
    answers: many(answers),
    analysisThemes: many(analysisThemes),
    survey: one(surveys, {
        fields: [questions.surveyId],
        references: [surveys.id]
    })
}));

export const activitiesRelations = relations(activities, ({one}) => ({
    survey: one(surveys, {
        fields: [activities.surveyId],
        references: [surveys.id]
    }),
    tenant: one(tenants, {
        fields: [activities.tenantId],
        references: [tenants.id]
    }),
    user: one(user, {
        fields: [activities.userId],
        references: [user.id]
    })
}));

export const respondentsRelations = relations(respondents, ({one, many}) => ({
    cohorts: many(respondentCohorts),
    responses: many(responses),
    tenant: one(tenants, {
        fields: [respondents.tenantId],
        references: [tenants.id]
    })
}));

export const responsesRelations = relations(responses, ({one, many}) => ({
    answers: many(answers),
    authenticityScores: many(authenticityScores),
    respondent: one(respondents, {
        fields: [responses.respondentId],
        references: [respondents.id]
    }),
    survey: one(surveys, {
        fields: [responses.surveyId],
        references: [surveys.id]
    }),
    tenant: one(tenants, {
        fields: [responses.tenantId],
        references: [tenants.id]
    })
}));

export const authenticityScoresRelations = relations(authenticityScores, ({one}) => ({
    overrideUser: one(user, {
        fields: [authenticityScores.overrideUserId],
        references: [user.id]
    }),
    response: one(responses, {
        fields: [authenticityScores.responseId],
        references: [responses.id]
    }),
    survey: one(surveys, {
        fields: [authenticityScores.surveyId],
        references: [surveys.id]
    })
}));

export const cohortsRelations = relations(cohorts, ({one, many}) => ({
    respondentCohorts: many(respondentCohorts),
    tenant: one(tenants, {
        fields: [cohorts.tenantId],
        references: [tenants.id]
    })
}));

export const respondentCohortsRelations = relations(respondentCohorts, ({one}) => ({
    assignedByUser: one(user, {
        fields: [respondentCohorts.assignedBy],
        references: [user.id]
    }),
    cohort: one(cohorts, {
        fields: [respondentCohorts.cohortId],
        references: [cohorts.id]
    }),
    respondent: one(respondents, {
        fields: [respondentCohorts.respondentId],
        references: [respondents.id]
    })
}));

export const analysisThemesRelations = relations(analysisThemes, ({one, many}) => ({
    question: one(questions, {
        fields: [analysisThemes.questionId],
        references: [questions.id]
    }),
    entries: many(analysisThemeEntries)
}));

export const analysisThemeEntriesRelations = relations(analysisThemeEntries, ({one}) => ({
    theme: one(analysisThemes, {
        fields: [analysisThemeEntries.themeId],
        references: [analysisThemes.id]
    }),
    answer: one(answers, {
        fields: [analysisThemeEntries.answerId],
        references: [answers.id]
    })
}));
