'use client';

import EmptyPanel from '@glint/ui/empty-panel';
import Spinner from '@glint/ui/spinner';
import {ArchiveIcon} from '@phosphor-icons/react/dist/ssr/Archive';
import {CheckIcon} from '@phosphor-icons/react/dist/ssr/Check';
import {PencilIcon} from '@phosphor-icons/react/dist/ssr/Pencil';
import {PlusIcon} from '@phosphor-icons/react/dist/ssr/Plus';
import {SpinnerGapIcon} from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import {TestTubeIcon} from '@phosphor-icons/react/dist/ssr/TestTube';
import {useSuspenseQuery} from '@tanstack/react-query';
import {lazy} from 'react';
import {DataTable} from '@/components/data-table';
import FormDialog from '@/components/form-dialog';
import {useTRPC} from '@/lib/trpc/react';
import {columns} from './columns';

const CreateSurveyForm = lazy(() => import('./create/form'));

const SurveyList: React.FC = () => {
    const trpc = useTRPC();
    const {data: surveys, isLoading} = useSuspenseQuery(trpc.surveys.getAll.queryOptions());

    if (isLoading) {
        return <Spinner />;
    }

    const renderCreateForm = () => (
        <FormDialog
            title="Create survey"
            trigger={
                <>
                    <PlusIcon />
                    Create survey
                </>
            }
        >
            <CreateSurveyForm />
        </FormDialog>
    );

    if (surveys.length === 0) {
        return (
            <EmptyPanel
                text="Create a survey to get started. You'll then be able to add questions and begin collecting responses."
                title="No surveys added yet"
            >
                {renderCreateForm()}
            </EmptyPanel>
        );
    }

    return (
        <DataTable
            columns={columns}
            data={surveys}
            facetedFilters={{
                status: {
                    label: 'Status',
                    options: [
                        {Icon: PencilIcon, label: 'Draft', value: 'draft'},
                        {Icon: TestTubeIcon, label: 'Testing', value: 'testing'},
                        {Icon: SpinnerGapIcon, label: 'Active', value: 'active'},
                        {Icon: CheckIcon, label: 'Complete', value: 'complete'},
                        {Icon: ArchiveIcon, label: 'Archived', value: 'archived'}
                    ]
                }
            }}
            toolbarActions={renderCreateForm}
        />
    );
};

export default SurveyList;
