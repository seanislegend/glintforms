'use client';

import EmptyPanel from '@glint/ui/empty-panel';
import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import type {Row} from '@tanstack/react-table';
import {useState} from 'react';
import {toast} from 'sonner';
import {DataTable} from '@/components/data-table';
import ConfirmationDialog from '@/components/dialogs/confirmation';
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

    const removeRespondent = useMutation(
        trpc.cohorts.removeRespondent.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.cohorts.getRespondents.queryKey(cohortId)
                });
                toast.success('Respondent removed from cohort');
                setDeleteRow(null);
            },
            onError: error => {
                toast.error(error.message || 'Failed to remove respondent from cohort');
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
                text="Add respondents to this cohort using the button above."
                title="No respondents in this cohort"
            />
        );
    }

    return (
        <>
            <DataTable
                columns={columns}
                data={respondents as RespondentList[]}
                inputFilterKey={null}
            />
            <ConfirmationDialog
                description="Are you sure you want to remove this respondent from the cohort? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onOpenChange={(open, reason) => {
                    if (!open && reason !== 'confirm-press') {
                        setDeleteRow(null);
                    }
                }}
                open={deleteRow !== null}
                pending={removeRespondent.isPending}
                title="Confirm remove"
                variant="destructive"
            />
        </>
    );
};

export default CohortRespondents;
