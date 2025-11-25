'use client';
'use no memo';

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@glint/ui/table';
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type PaginationState,
    type SortingState,
    useReactTable,
    type VisibilityState
} from '@tanstack/react-table';
import {useState} from 'react';
import {arrayIncludes} from '@/components/data-table/utils';
import {DataTablePagination} from './pagination';
import {useFilterSearchParams, usePaginationSearchParams} from './parsers';
import {DataTableToolbar} from './toolbar';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    facetedFilters?: Record<
        string,
        | {dynamic: true; label: string}
        | {dynamic?: false | undefined; label: string; options: FacetedFilterItem[]}
    >;
    hasPagination?: boolean;
    hasManualPagination?: boolean;
    inputFilterKey?: string | null;
    rowCount?: number;
    tableClassName?: string;
    toolbarActions?: (filters: ColumnFiltersState, pagination: PaginationState) => React.ReactNode;
}

export const DataTable = <TData, TValue>({
    columns,
    data,
    facetedFilters,
    hasPagination = true,
    hasManualPagination = false,
    inputFilterKey = 'title',
    rowCount,
    tableClassName = '',
    toolbarActions
}: DataTableProps<TData, TValue>) => {
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [filterState, setFilterState] = useFilterSearchParams();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = usePaginationSearchParams();

    const columnFilters = filterState.columnFilters;

    const setColumnFilters = (updater: any) => {
        if (typeof updater === 'function') {
            setFilterState({columnFilters: updater(columnFilters)});
        } else {
            setFilterState({columnFilters: updater});
        }
    };

    const table = useReactTable({
        data,
        columns,
        filterFns: {arrayIncludes},
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination
        },
        manualPagination: hasManualPagination,
        rowCount: hasManualPagination && rowCount ? rowCount : undefined,
        initialState: {pagination, columnFilters},
        enableRowSelection: false,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues()
    });

    const handleResetFilters = () => {
        table.resetColumnFilters();
        setFilterState({columnFilters: []});
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            <DataTableToolbar
                handleResetFilters={handleResetFilters}
                facetedFilters={facetedFilters}
                inputFilterKey={inputFilterKey}
                table={table}
            >
                {toolbarActions?.(columnFilters, pagination)}
            </DataTableToolbar>
            <div className="border rounded overflow-hidden">
                <Table className={tableClassName}>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {hasPagination && <DataTablePagination table={table} />}
            <div className="h-4" />
        </div>
    );
};
