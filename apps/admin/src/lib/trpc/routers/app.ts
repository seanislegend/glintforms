import {createTRPCRouter} from '@/lib/trpc/init';
import {activitiesRouter} from '@/lib/trpc/routers/activities';
import {answersRouter} from '@/lib/trpc/routers/answers';
import {authenticityRouter} from '@/lib/trpc/routers/authenticity';
import {breadcrumbsRouter} from '@/lib/trpc/routers/breadcrumbs';
import {campaignsRouter} from '@/lib/trpc/routers/campaigns';
import {cohortsRouter} from '@/lib/trpc/routers/cohorts';
import {navRouter} from '@/lib/trpc/routers/nav';
import {questionsRouter} from '@/lib/trpc/routers/questions';
import {respondentsRouter} from '@/lib/trpc/routers/respondents';
import {responsesRouter} from '@/lib/trpc/routers/responses';
import {screenersRouter} from '@/lib/trpc/routers/screeners';
import {actionsRouter} from '@/lib/trpc/routers/survey-actions';
import {surveysRouter} from '@/lib/trpc/routers/surveys';
import {unprocessedSubmissionsRouter} from '@/lib/trpc/routers/unprocessed-submissions';

export const appRouter = createTRPCRouter({
    answers: answersRouter,
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
    screeners: screenersRouter,
    surveys: surveysRouter,
    unprocessedSubmissions: unprocessedSubmissionsRouter
});

export type AppRouter = typeof appRouter;
