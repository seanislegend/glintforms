'use client';

import EmptyPanel from '@glint/ui/empty-panel';
import {useQuery} from '@tanstack/react-query';
import * as R from 'remeda';
import {DataTable} from '@/components/data-table';
import {useI18n} from '@/hooks/use-i18n';
import type {RespondentList} from '@/lib/schemas/respondents';
import {useTRPC} from '@/lib/trpc/react';
import {createColumns} from './columns';

const RespondentsList: React.FC = () => {
    const {t} = useI18n();
    const trpc = useTRPC();
    const {data: respondents, isLoading} = useQuery(trpc.respondents.getAll.queryOptions());

    if (isLoading || !respondents) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-sm text-muted-foreground">{t('Loading respondents...')}</div>
            </div>
        );
    }

    if (respondents.length === 0) {
        return (
            <EmptyPanel
                text={t(
                    "Create a respondent to get started. You'll then be able to track their survey responses and engagement."
                )}
                title={t('No respondents added yet')}
            />
        );
    }

    const uniqueSurveys = R.pipe(
        respondents,
        R.flatMap(r => r.surveys ?? []),
        R.filter(s => Boolean(s?.id)),
        R.uniqueBy(s => s.id),
        R.map(s => ({
            label: s.title,
            value: s.id,
            count: respondents.flatMap(r => r.surveys ?? []).filter(survey => survey?.id === s.id)
                .length
        }))
    );
    const uniqueCampaigns = R.pipe(
        respondents,
        R.flatMap(r => r.surveys ?? []),
        R.filter(s => Boolean(s?.campaignId && s?.campaignTitle)),
        // biome-ignore lint/style/noNonNullAssertion: wip
        R.map(s => ({id: s.campaignId!, title: s.campaignTitle!})),
        R.uniqueBy(c => c.id),
        R.map(c => ({
            label: c.title,
            value: c.id,
            count: respondents
                .flatMap(r => r.surveys ?? [])
                .filter(survey => survey?.campaignId === c.id).length
        }))
    );
    const uniqueCohorts = R.pipe(
        respondents,
        R.flatMap(r => r.cohorts ?? []),
        R.filter(c => Boolean(c?.id && c?.name)),
        // biome-ignore lint/style/noNonNullAssertion: wip
        R.map(c => ({id: c.id!, name: c.name!, surveyId: c.surveyId, surveyTitle: c.surveyTitle})),
        R.uniqueBy(c => c.id),
        R.map(c => ({
            label: c.surveyId ? `${c.name} (${c.surveyTitle})` : c.name,
            value: c.id,
            count: respondents.flatMap(r => r.cohorts ?? []).filter(cohort => cohort?.id === c.id)
                .length
        }))
    );

    return (
        <DataTable
            columns={createColumns(t)}
            data={respondents as RespondentList[]}
            facetedFilters={{
                surveys: {
                    label: t('Survey'),
                    options: uniqueSurveys.map(s => ({
                        count: s.count,
                        label: s.label,
                        value: s.value
                    }))
                },
                campaigns: {
                    label: t('Campaign'),
                    options: uniqueCampaigns.map(c => ({
                        count: c.count,
                        label: c.label,
                        value: c.value
                    }))
                },
                cohorts: {
                    label: t('Cohort'),
                    options: uniqueCohorts.map(c => ({
                        count: c.count,
                        label: c.label,
                        value: c.value
                    }))
                },
                gender: {
                    dynamic: true,
                    label: t('Gender')
                }
            }}
            inputFilterKey="name"
        />
    );
};

export default RespondentsList;
