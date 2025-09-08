'use client';

import EmptyPanel from '@glint/ui/empty-panel';
import {PlusIcon} from '@phosphor-icons/react/dist/ssr/Plus';
import {useSuspenseQuery} from '@tanstack/react-query';
import {lazy} from 'react';
import {DataTable} from '@/components/data-table';
import FormDialog from '@/components/form-dialog';
import type {CampaignList} from '@/lib/schemas/campaigns';
import {useTRPC} from '@/lib/trpc/react';
import {columns} from './columns';

const CreateCampaignForm = lazy(() => import('./create/form'));

const CampaignsList: React.FC = () => {
    const trpc = useTRPC();
    const {data: campaigns, isLoading} = useSuspenseQuery(trpc.campaigns.getAll.queryOptions());

    const renderCreateForm = () => (
        <FormDialog
            title="Create campaign"
            trigger={
                <>
                    <PlusIcon />
                    Create campaign
                </>
            }
        >
            <CreateCampaignForm />
        </FormDialog>
    );

    if (campaigns.length === 0 && !isLoading) {
        return (
            <EmptyPanel
                text="Create a campaign to get started. You'll then be able to create surveys and begin collecting responses."
                title="No campaigns added yet"
            >
                {renderCreateForm()}
            </EmptyPanel>
        );
    }

    return (
        <DataTable
            columns={columns}
            data={campaigns as CampaignList[]}
            inputFilterKey="title"
            toolbarActions={renderCreateForm}
        />
    );
};

export default CampaignsList;
