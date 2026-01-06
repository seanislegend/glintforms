import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import PageSpinner from '@/components/page-spinner';
import {getServerI18n} from '@/lib/i18n-server';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import AnswersList from './list';

interface Props {
    params: Promise<{locale: Locale; surveyId: string}>;
}

const SurveyAnswersPage: React.FC<React.PropsWithChildren<Props>> = async ({params}) => {
    const {locale, surveyId} = await params;
    prefetch(trpc.answers.getQuestionStats.queryOptions(surveyId));
    const {t} = await getServerI18n(locale);

    return (
        <HydrateClient>
            <Container>
                <SectionHeader
                    text={t(
                        'Review each question, its unique answers, and dive deeper when needed.'
                    )}
                    title={t('Answers')}
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
