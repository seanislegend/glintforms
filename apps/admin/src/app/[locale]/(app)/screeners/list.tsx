'use client';

import Button from '@glint/ui/button';
import EmptyPanel from '@glint/ui/empty-panel';
import Link from '@glint/ui/link';
import {PlusIcon} from '@phosphor-icons/react/dist/ssr/Plus';
import {useSuspenseQuery} from '@tanstack/react-query';
import {DataTable} from '@/components/data-table';
import {useI18n} from '@/hooks/use-i18n';
import type {ScreenerList} from '@/lib/schemas/screeners';
import {useTRPC} from '@/lib/trpc/react';
import {createColumns} from './columns';

const ScreenersList: React.FC = () => {
    const {t} = useI18n();
    const trpc = useTRPC();
    const {data: screeners, isLoading} = useSuspenseQuery(trpc.screeners.getAll.queryOptions());

    if (isLoading || !screeners) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-sm text-muted-foreground">{t('Loading screeners...')}</div>
            </div>
        );
    }

    const renderCreateButton = () => (
        <Button render={<Link href="/screeners/create" />}>
            <PlusIcon />
            {t('Create screener')}
        </Button>
    );

    if (screeners.length === 0) {
        return (
            <EmptyPanel
                text={t('Create a screener to filter respondents before they can access a survey.')}
                title={t('No screeners created yet')}
            >
                {renderCreateButton()}
            </EmptyPanel>
        );
    }

    return (
        <DataTable
            columns={createColumns(t)}
            data={screeners as ScreenerList[]}
            inputFilterKey="name"
            toolbarActions={renderCreateButton}
        />
    );
};

export default ScreenersList;
