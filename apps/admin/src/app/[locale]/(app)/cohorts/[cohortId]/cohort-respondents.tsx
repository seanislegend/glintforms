'use client';

import EmptyPanel from '@glint/ui/empty-panel';
import {t} from '@/lib/i18n';
import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import type {Row} from '@tanstack/react-table';
import {useState} from 'react';
import {toast} from 'sonner';
import {DataTable} from '@/components/data-table';
import ConfirmationDialog from '@/components/dialogs/confirmation';
import HighlightChange from '@/components/highlight-change';
import useHighlight from '@/hooks/use-highlight';
import type {RespondentList} from '@/lib/schemas/respondents';
import {useTRPC} from '@/lib/trpc/react';
import {createColumns} from './columns';

interface Props {
    cohortId: string;
}

const CohortRespondents: React.FC<Props> = ({cohortId}) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const {data: respondents} = useSuspenseQuery(
        trpc.cohorts.getRespondents.queryOptions(cohortId)
    );
    const [deleteRow, setDeleteRow] = useState<Row<RespondentList> | null>(null);
    const {highlight} = useHighlight();

    const removeRespondent = useMutation(
        trpc.cohorts.removeRespondent.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.cohorts.getRespondents.queryKey(cohortId)
                });
                toast.success(t('Respondent removed from cohort'));
                setDeleteRow(null);
                highlight('cohorts-respondents-list');
            },
            onError: error => {
                toast.error(error.message || t('Failed to remove respondent from cohort'));
            }
        })
    );

    const handleDelete = (row: Row<RespondentList>) => {
        setDeleteRow(row);
    };

    const handleConfirmDelete = async () => {
        if (deleteRow) {
            await removeRespondent.mutateAsync({
                cohortId,
                respondentId: deleteRow.original.id
            });
        }
    };

    const columns = createColumns(handleDelete);

    if (respondents.length === 0) {
        return (
            <EmptyPanel
                text={t('Add respondents to this cohort using the button above.')}
                title={t('No respondents in this cohort')}
            />
        );
    }

    return (
        <>
            <HighlightChange id="cohorts-respondents-list">
                <DataTable
                    columns={columns}
                    data={respondents as RespondentList[]}
                    inputFilterKey={null}
                />
            </HighlightChange>
            <ConfirmationDialog
                description={t(
                    'Are you sure you want to remove this respondent from the cohort? This action cannot be undone.'
                )}
                onConfirm={handleConfirmDelete}
                onOpenChange={(open, reason) => {
                    if (!open && reason !== 'confirm-press') {
                        setDeleteRow(null);
                    }
                }}
                open={deleteRow !== null}
                pending={removeRespondent.isPending}
                title={t('Confirm remove')}
                variant="destructive"
            />
        </>
    );
};

export default CohortRespondents;
