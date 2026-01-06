'use client';

import Button from '@glint/ui/button';
import {ChartBarIcon} from '@phosphor-icons/react/dist/ssr/ChartBar';
import {ChartLineIcon} from '@phosphor-icons/react/dist/ssr/ChartLine';
import {GearIcon} from '@phosphor-icons/react/dist/ssr/Gear';
import {HouseIcon} from '@phosphor-icons/react/dist/ssr/House';
import {QuestionMarkIcon} from '@phosphor-icons/react/dist/ssr/QuestionMark';
import {TextAlignLeftIcon} from '@phosphor-icons/react/dist/ssr/TextAlignLeft';
import {useSuspenseQuery} from '@tanstack/react-query';
import Link from 'next/link';
import {redirect, usePathname} from 'next/navigation';
import SurveyStatusBadge from '@/components/badges/survey-status';
import {surveyHasLaunched, surveyIsTesting} from '@/lib/surveys/status';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    surveyId: string;
}

export const SurveyNavbarWrapper: React.FC<React.PropsWithChildren> = ({children}) => {
    return (
        <div className="flex bg-white border-b border-accent items-center [&>span]:h-full [&>span]:flex [&>span>a,&>span>button]:h-full [&>span>a,&>span>button]:bg-white [&>span:last-child]:border-r [&>span:last-child]:border-accent [&>span>a[data-active=true],&>span>button[data-active=true]]:bg-accent [&>span>a[data-active=true],&>span>button[data-active=true]]:pointer-events-none p-2 space-x-2 max-w-full overflow-x-auto">
            {children}
        </div>
    );
};

const SurveyNavbar: React.FC<Props> = ({surveyId}) => {
    const trpc = useTRPC();
    const {data: survey, isLoading} = useSuspenseQuery(trpc.surveys.get.queryOptions(surveyId));
    const pathname = usePathname();

    const isPathActive = (path: string) => {
        if (path === '/') {
            return pathname === `/surveys/${surveyId}`;
        }
        return pathname.includes(`/surveys/${surveyId}/${path}`);
    };

    if (!survey && !isLoading) {
        redirect('/surveys');
    } else if (!survey) {
        return null;
    }

    const hasLaunched = surveyHasLaunched(survey.status);
    const isTesting = surveyIsTesting(survey.status);

    return (
        <SurveyNavbarWrapper>
            <div className="flex items-center flex-row gap-x-2 flex-grow">
                <span>
                    <Button
                        data-active={isPathActive('/')}
                        render={<Link href={`/surveys/${survey.id}`} />}
                        size="sm"
                        variant="ghost"
                    >
                        <HouseIcon />
                        Overview
                    </Button>
                </span>
                <span>
                    <Button
                        data-active={isPathActive('settings')}
                        render={<Link href={`/surveys/${survey.id}/settings`} />}
                        size="sm"
                        variant="ghost"
                    >
                        <GearIcon />
                        Settings
                    </Button>
                </span>
                <span>
                    <Button
                        data-active={isPathActive('questions')}
                        render={<Link href={`/surveys/${survey.id}/questions`} />}
                        size="sm"
                        variant="ghost"
                    >
                        <QuestionMarkIcon />
                        Questions
                    </Button>
                </span>
                <span>
                    <Button
                        data-active={isPathActive('responses')}
                        {...(hasLaunched || isTesting
                            ? {render: <Link href={`/surveys/${survey.id}/responses`} />}
                            : {disabled: true})}
                        size="sm"
                        variant="ghost"
                    >
                        <ChartLineIcon />
                        Responses
                    </Button>
                </span>
                <span>
                    <Button
                        data-active={isPathActive('answers')}
                        {...(hasLaunched || isTesting
                            ? {render: <Link href={`/surveys/${survey.id}/answers`} />}
                            : {disabled: true})}
                        size="sm"
                        variant="ghost"
                    >
                        <TextAlignLeftIcon />
                        Answers
                    </Button>
                </span>
                <span>
                    <Button
                        data-active={isPathActive('insights')}
                        {...(hasLaunched
                            ? {render: <Link href={`/surveys/${survey.id}/insights`} />}
                            : {disabled: true})}
                        size="sm"
                        variant="ghost"
                    >
                        <ChartBarIcon />
                        Insights
                    </Button>
                </span>
            </div>
            <div className="flex items-center flex-row gap-x-1">
                <SurveyStatusBadge className="h-full" size="sm" status={survey.status} />
            </div>
        </SurveyNavbarWrapper>
    );
};

export default SurveyNavbar;
