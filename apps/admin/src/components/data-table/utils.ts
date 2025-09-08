import type {FilterFn} from '@tanstack/react-table';

export const arrayIncludes: FilterFn<any> = (row, columnId, filterValue) => {
    const cellValue = row.getValue<any[]>(columnId);
    if (!Array.isArray(cellValue)) return false;

    if (Array.isArray(filterValue)) {
        // e.g. multi-select filter: keep row if it has ANY of the selected values
        return filterValue.some(val => cellValue.includes(val));
    }

    return cellValue.includes(filterValue);
};
