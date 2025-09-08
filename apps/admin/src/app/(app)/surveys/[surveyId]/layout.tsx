import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import SurveyNavbar, {SurveyNavbarWrapper} from './navbar';

interface Props {
    params: Promise<{surveyId: string}>;
}

const SurveyLayout: React.FC<React.PropsWithChildren<Props>> = async ({children, params}) => {
    const {surveyId} = await params;
    prefetch(trpc.surveys.get.queryOptions(surveyId));

    return (
        <>
            <HydrateClient>
                <Suspense
                    fallback={
                        <SurveyNavbarWrapper>
                            <div className="h-full w-28 bg-accent animate-pulse" />
                            <div className="h-full w-30 bg-accent animate-pulse" />
                            <div className="h-full w-32 bg-accent animate-pulse" />
                            <div className="h-full w-30 bg-accent animate-pulse" />
                        </SurveyNavbarWrapper>
                    }
                >
                    <SurveyNavbar surveyId={surveyId} />
                </Suspense>
            </HydrateClient>
            {children}
        </>
    );
};

export default SurveyLayout;
