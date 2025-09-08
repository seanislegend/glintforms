import type {ColumnFiltersState} from '@tanstack/react-table';
import {createParser, parseAsIndex, parseAsInteger, useQueryStates} from 'nuqs';

export const parseAsColumnFilters = createParser({
    parse: (value: string | null): ColumnFiltersState => {
        if (!value) return [];

        try {
            const filters: ColumnFiltersState = [];
            const filterPairs = value.split('|');

            for (const pair of filterPairs) {
                const [field, values] = pair.split(':');
                if (field && values) {
                    const parsedValues = values.split(',').map(v => {
                        // handle boolean values
                        if (v === 'true') return true;
                        if (v === 'false') return false;
                        // handle numbers
                        if (!Number.isNaN(Number(v))) return Number(v);
                        // handle null
                        if (v === 'null') return null;
                        // default to string
                        return v;
                    });

                    filters.push({
                        id: field,
                        value: parsedValues.length === 1 ? parsedValues[0] : parsedValues
                    });
                }
            }

            return filters;
        } catch {
            return [];
        }
    },
    serialize: (value: ColumnFiltersState): string => {
        if (!value || value.length === 0) return '';

        return value
            .map(filter => {
                const values = Array.isArray(filter.value) ? filter.value : [filter.value];
                const serializedValues = values
                    .map(v => {
                        if (v === null) return 'null';
                        if (typeof v === 'boolean') return String(v);
                        if (typeof v === 'number') return String(v);
                        return String(v);
                    })
                    .join(',');

                return `${filter.id}:${serializedValues}`;
            })
            .join('|');
    }
});

export const paginationParsers = {
    pageIndex: parseAsIndex.withDefault(0),
    pageSize: parseAsInteger.withDefault(30)
};

export const paginationUrlKeys = {
    pageIndex: 'page',
    pageSize: 'perPage'
};

export const filterParsers = {
    columnFilters: parseAsColumnFilters.withDefault([])
};

export const filterUrlKeys = {
    columnFilters: 'filters'
};

export const usePaginationSearchParams = () => {
    return useQueryStates(paginationParsers, {
        urlKeys: paginationUrlKeys
    });
};

export const useFilterSearchParams = () => {
    return useQueryStates(filterParsers, {
        urlKeys: filterUrlKeys
    });
};
