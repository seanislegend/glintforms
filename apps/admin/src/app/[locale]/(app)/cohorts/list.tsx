'use client';

import EmptyPanel from '@glint/ui/empty-panel';
import {PlusIcon} from '@phosphor-icons/react/dist/ssr/Plus';
import {useSuspenseQuery} from '@tanstack/react-query';
import {DataTable} from '@/components/data-table';
import FormDialog from '@/components/form-dialog';
import {useI18n} from '@/hooks/use-i18n';
import type {CohortList} from '@/lib/schemas/cohorts';
import {useTRPC} from '@/lib/trpc/react';
import {createColumns} from './columns';
import CohortForm from './form';

const CohortsList: React.FC = () => {
    const {t} = useI18n();
    const trpc = useTRPC();
    const {data: cohorts, isLoading} = useSuspenseQuery(trpc.cohorts.getAll.queryOptions());

    if (isLoading || !cohorts) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-sm text-muted-foreground">{t('Loading cohorts...')}</div>
            </div>
        );
    }

    const renderCreateForm = () => (
        <FormDialog
            title={t('Create cohort')}
            trigger={
                <>
                    <PlusIcon />
                    {t('Create cohort')}
                </>
            }
        >
            <CohortForm />
        </FormDialog>
    );

    if (cohorts.length === 0) {
        return (
            <EmptyPanel
                text={t('Create a cohort to group respondents for segmentation and analysis.')}
                title={t('No cohorts created yet')}
            >
                {renderCreateForm()}
            </EmptyPanel>
        );
    }

    return (
        <DataTable
            columns={createColumns(t)}
            data={cohorts as CohortList[]}
            inputFilterKey="name"
            toolbarActions={renderCreateForm}
        />
    );
};

export default CohortsList;
