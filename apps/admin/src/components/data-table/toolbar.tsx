'use client';
'use no memo';

import Input from '@glint/form/input';
import Button from '@glint/ui/button';
import {XIcon} from '@phosphor-icons/react/dist/ssr/X';
import type {Table} from '@tanstack/react-table';
import type React from 'react';
import {DataTableFacetedFilter} from '@/components/data-table/faceted-filter';
import {humanise} from '@/utils/humanise';

interface DataTableToolbarProps<TData> {
    children?: React.ReactNode;
    facetedFilters?: Record<
        string,
        | {dynamic: true; label: string; options?: FacetedFilterItem[]}
        | {dynamic?: false | undefined; label: string; options: FacetedFilterItem[]}
    >;
    handleResetFilters: () => void;
    inputFilterKey: string | null;
    table: Table<TData>;
}

export const DataTableToolbar = <TData,>({
    children,
    facetedFilters,
    handleResetFilters,
    inputFilterKey = 'title',
    table
}: React.PropsWithChildren<DataTableToolbarProps<TData>>) => {
    const isFiltered = table.getState().columnFilters.length > 0;

    if (!facetedFilters && !isFiltered && !inputFilterKey && !children) {
        return null;
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {inputFilterKey && (
                    <Input
                        placeholder="Type to filter data..."
                        value={(table.getColumn(inputFilterKey)?.getFilterValue() as string) ?? ''}
                        onChange={event => {
                            table.getColumn(inputFilterKey)?.setFilterValue(event.target.value);
                        }}
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}
                {facetedFilters &&
                    Object.entries(facetedFilters).map(([key, filter]) => {
                        // for non-dynamic filters, options are guaranteed to be present
                        if (!filter.dynamic) {
                            return (
                                <DataTableFacetedFilter
                                    key={key}
                                    column={table.getColumn(key)}
                                    title={filter.label}
                                    options={filter.options}
                                />
                            );
                        }
                        const uniqeValues = Array.from(
                            table.getColumn(key)?.getFacetedUniqueValues()?.keys() || []
                        );
                        const options = uniqeValues
                            .map(value => {
                                const label = value ? humanise(value) : 'Empty';
                                return {label, value};
                            })
                            .sort((a, b) => a.label.localeCompare(b.label));

                        return (
                            <DataTableFacetedFilter
                                key={key}
                                column={table.getColumn(key)}
                                title={filter.label}
                                options={options}
                            />
                        );
                    })}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={handleResetFilters}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <XIcon />
                    </Button>
                )}
            </div>
            <div>{children}</div>
        </div>
    );
};
