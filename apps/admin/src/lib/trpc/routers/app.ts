import {createTRPCRouter} from '@/lib/trpc/init';
import {activitiesRouter} from '@/lib/trpc/routers/activities';
import {authenticityRouter} from '@/lib/trpc/routers/authenticity';
import {breadcrumbsRouter} from '@/lib/trpc/routers/breadcrumbs';
import {campaignsRouter} from '@/lib/trpc/routers/campaigns';
import {cohortsRouter} from '@/lib/trpc/routers/cohorts';
import {navRouter} from '@/lib/trpc/routers/nav';
import {questionsRouter} from '@/lib/trpc/routers/questions';
import {respondentsRouter} from '@/lib/trpc/routers/respondents';
import {responsesRouter} from '@/lib/trpc/routers/responses';
import {actionsRouter} from '@/lib/trpc/routers/survey-actions';
import {surveysRouter} from '@/lib/trpc/routers/surveys';

export const appRouter = createTRPCRouter({
    actions: actionsRouter,
    activities: activitiesRouter,
    authenticity: authenticityRouter,
    breadcrumbs: breadcrumbsRouter,
    campaigns: campaignsRouter,
    cohorts: cohortsRouter,
    nav: navRouter,
    questions: questionsRouter,
    respondents: respondentsRouter,
    responses: responsesRouter,
    surveys: surveysRouter
});

export type AppRouter = typeof appRouter;
