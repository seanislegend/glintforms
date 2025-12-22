'use client';

import Button from '@glint/ui/button';
import EmptyPanel from '@glint/ui/empty-panel';
import {PlusIcon} from '@phosphor-icons/react/dist/ssr/Plus';
import {DataTable} from '@/components/data-table';
import type {SearchResult} from './columns';
import {columns} from './columns';

interface Props {
    addRespondentsToCohort: {
        mutateAsync: (data: {cohortId: string; respondentIds: string[]}) => Promise<any>;
        status: 'idle' | 'pending' | 'error' | 'success';
    };
    cohortId: string;
    searchResults: SearchResult[];
}

export const SearchResultsList: React.FC<Props> = ({
    addRespondentsToCohort,
    cohortId,
    searchResults
}) => {
    if (searchResults.length === 0) {
        return (
            <EmptyPanel
                text="Submit the filters to search for respondents, or try different filters if you don't see any results."
                title="No respondents"
            />
        );
    }

    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <strong className="font-medium">{searchResults.length} respondents found</strong>
                <Button
                    onClick={() => {
                        addRespondentsToCohort.mutateAsync({
                            cohortId,
                            respondentIds: searchResults.map(r => r.id)
                        });
                    }}
                    pending={addRespondentsToCohort.status === 'pending'}
                >
                    <PlusIcon />
                    Add all to cohort
                </Button>
            </div>
            <DataTable columns={columns} data={searchResults} inputFilterKey={null} />
        </>
    );
};
