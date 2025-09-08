import Button from '@glint/ui/button';
import {Menu, MenuItem, MenuPopup, MenuSeparator, MenuTrigger} from '@glint/ui/menu';
import {cn} from '@glint/ui/utils';
import {ArrowDownIcon} from '@phosphor-icons/react/dist/ssr/ArrowDown';
import {ArrowUpIcon} from '@phosphor-icons/react/dist/ssr/ArrowUp';
import {CaretUpDownIcon} from '@phosphor-icons/react/dist/ssr/CaretUpDown';
import {EyeSlashIcon} from '@phosphor-icons/react/dist/ssr/EyeSlash';
import type {Column} from '@tanstack/react-table';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
}

export const DataTableColumnHeader = <TData, TValue>({
    column,
    title,
    className
}: DataTableColumnHeaderProps<TData, TValue>) => {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>;
    }

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <div className="overflow-hidden">
                <Menu>
                    <MenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-3 h-8 data-[state=open]:bg-accent"
                            >
                                <span>{title}</span>
                                {column.getIsSorted() === 'desc' ? (
                                    <ArrowDownIcon className="size-3" />
                                ) : column.getIsSorted() === 'asc' ? (
                                    <ArrowUpIcon className="size-3" />
                                ) : (
                                    <CaretUpDownIcon className="size-3" />
                                )}
                            </Button>
                        }
                    />
                    <MenuPopup>
                        <MenuItem onClick={() => column.toggleSorting(false)}>
                            <ArrowUpIcon className="size-4" />
                            Asc
                        </MenuItem>
                        <MenuItem onClick={() => column.toggleSorting(true)}>
                            <ArrowDownIcon className="size-4" />
                            Desc
                        </MenuItem>
                        <MenuSeparator />
                        <MenuItem onClick={() => column.toggleVisibility(false)}>
                            <EyeSlashIcon className="size-4" />
                            Hide
                        </MenuItem>
                    </MenuPopup>
                </Menu>
            </div>
        </div>
    );
};
