'use client';

import EmptyPanel from '@glint/ui/empty-panel';
import {useSuspenseQuery} from '@tanstack/react-query';
import {DataTable} from '@/components/data-table';
import type {RespondentList} from '@/lib/schemas/respondents';
import {useTRPC} from '@/lib/trpc/react';
import {columns} from '../../respondents/columns';

interface Props {
    cohortId: string;
}

const CohortRespondents: React.FC<Props> = ({cohortId}) => {
    const trpc = useTRPC();
    const {data: respondents} = useSuspenseQuery(
        trpc.cohorts.getRespondents.queryOptions(cohortId)
    );

    if (respondents.length === 0) {
        return (
            <EmptyPanel
                text="Add respondents to this cohort using the button above."
                title="No respondents in this cohort"
            />
        );
    }

    return (
        <DataTable columns={columns} data={respondents as RespondentList[]} inputFilterKey={null} />
    );
};

export default CohortRespondents;
