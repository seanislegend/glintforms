import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import PageSpinner from '@/components/page-spinner';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import AnswersList from './list';

interface Props {
    params: Promise<{surveyId: string}>;
}

const SurveyAnswersPage: React.FC<React.PropsWithChildren<Props>> = async ({params}) => {
    const {surveyId} = await params;
    prefetch(trpc.answers.getQuestionStats.queryOptions(surveyId));

    return (
        <HydrateClient>
            <Container>
                <SectionHeader
                    text="Review each question, its unique answers, and dive deeper when needed."
                    title="Answers"
                />
                <Spacer size="md" />
                <Suspense fallback={<PageSpinner />}>
                    <AnswersList surveyId={surveyId} />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default SurveyAnswersPage;
