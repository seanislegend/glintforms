'use client';

import EmptyPanel from '@glint/ui/empty-panel';
import {t} from '@/lib/i18n';
import {useSuspenseQuery} from '@tanstack/react-query';
import {DataTable} from '@/components/data-table';
import ExportResponsesDialog from '@/components/dialogs/export-responses';
import {useTRPC} from '@/lib/trpc/react';
import {columns} from './columns';
import ResponseQuickView from './response-quick-view';

interface Props {
    surveyId: string;
}

const ResponsesList: React.FC<Props> = ({surveyId}) => {
    const trpc = useTRPC();
    const {data, isLoading} = useSuspenseQuery(
        trpc.responses.getAll.queryOptions({surveyId, limit: 200, offset: 0})
    );

    if (data.responses.length === 0 && !isLoading) {
        return (
            <EmptyPanel
                text={t("Once you start receiving responses, you'll be able to view them here.")}
                title={t('No responses added yet')}
            />
        );
    }

    return (
        <>
            <DataTable
                columns={columns}
                data={data.responses}
                facetedFilters={{
                    was_completed: {
                        label: t('Completion status'),
                        options: [
                            {label: t('Completed'), value: true},
                            {label: t('Incomplete'), value: false}
                        ]
                    },
                    authentic_response: {
                        label: t('Authenticity'),
                        options: [
                            {label: t('Pass'), value: true},
                            {label: t('Fail'), value: false},
                            {label: t('Missing'), value: null}
                        ]
                    }
                }}
                inputFilterKey="respondentId"
                toolbarActions={(filters, pagination) => (
                    <ExportResponsesDialog
                        filters={filters}
                        pagination={pagination}
                        surveyId={surveyId}
                    />
                )}
            />
            <ResponseQuickView />
        </>
    );
};

export default ResponsesList;
