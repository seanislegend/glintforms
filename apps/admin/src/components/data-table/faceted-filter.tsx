'use no memo';

import {Badge} from '@glint/ui/badge';
import Button from '@glint/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from '@glint/ui/command';
import {Popover, PopoverPopup, PopoverTrigger} from '@glint/ui/popover';
import {Separator} from '@glint/ui/separator';
import {cn} from '@glint/ui/utils';
import {CheckIcon} from '@phosphor-icons/react/dist/ssr/Check';
import {PlusCircleIcon} from '@phosphor-icons/react/dist/ssr/PlusCircle';
import type {Column} from '@tanstack/react-table';

export interface DataTableFacetedFilterProps<TData, TValue> {
    column?: Column<TData, TValue>;
    options: (FacetedFilterItem & {count?: number})[];
    title?: string;
}

export const DataTableFacetedFilter = <TData, TValue>({
    column,
    options,
    title
}: DataTableFacetedFilterProps<TData, TValue>) => {
    const facets = column?.getFacetedUniqueValues();
    const filterValue = column?.getFilterValue();
    const selectedValues = new Set(
        Array.isArray(filterValue) ? filterValue : filterValue != null ? [filterValue] : []
    );
    const hasSelectedValues = selectedValues.size > 0;

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            'min-h-full border-dashed ring-0 border hover:border-solid',
                            hasSelectedValues && 'border-solid shadow-xs'
                        )}
                    >
                        <PlusCircleIcon />
                        {title}
                        {hasSelectedValues && (
                            <>
                                <Separator orientation="vertical" className="mx-2 h-4" />
                                <Badge variant="secondary" className="px-1 font-normal lg:hidden">
                                    {selectedValues.size}
                                </Badge>
                                <div className="hidden space-x-1 lg:flex -mr-2 -ml-3">
                                    {selectedValues.size > 2 ? (
                                        <Badge variant="secondary" className="px-1 font-normal">
                                            {selectedValues.size} selected
                                        </Badge>
                                    ) : (
                                        options
                                            .filter(option => selectedValues.has(option.value))
                                            .map(option => (
                                                <Badge
                                                    key={String(option.value)}
                                                    className="px-1 font-normal"
                                                    variant="secondary"
                                                >
                                                    {option.label}
                                                </Badge>
                                            ))
                                    )}
                                </div>
                            </>
                        )}
                    </Button>
                }
            />
            <PopoverPopup className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map(option => {
                                const isSelected = selectedValues.has(option.value);
                                return (
                                    <CommandItem
                                        key={String(option.value)}
                                        onSelect={() => {
                                            if (isSelected) {
                                                selectedValues.delete(option.value);
                                            } else {
                                                selectedValues.add(option.value);
                                            }
                                            const filterValues = Array.from(selectedValues);
                                            column?.setFilterValue(
                                                filterValues.length ? filterValues : undefined
                                            );
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                'mr-2 rounded flex size-5 items-center justify-center border border-slate-300',
                                                isSelected
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : '[&_svg]:invisible'
                                            )}
                                        >
                                            <CheckIcon className="text-primary-foreground" />
                                        </div>
                                        {option.Icon && (
                                            <option.Icon className="size-5 text-muted-foreground" />
                                        )}
                                        <span>{option.label}</span>
                                        {(option.count !== undefined ||
                                            facets?.get(option.value)) && (
                                            <span className="ml-auto flex size-5 items-center justify-center font-mono text-xs">
                                                {option.count !== undefined
                                                    ? option.count
                                                    : facets?.get(option.value)}
                                            </span>
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {selectedValues.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => column?.setFilterValue(undefined)}
                                        className="justify-center text-center"
                                    >
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverPopup>
        </Popover>
    );
};
