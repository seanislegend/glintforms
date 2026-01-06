'use client';

import Button from '@glint/ui/button';
import {Menu, MenuItem, MenuPopup, MenuSeparator, MenuShortcut, MenuTrigger} from '@glint/ui/menu';
import {t} from '@/lib/i18n';
import {ArrowRightIcon} from '@phosphor-icons/react/dist/ssr/ArrowRight';
import {DotsThreeIcon} from '@phosphor-icons/react/dist/ssr/DotsThree';
import {PencilSimpleIcon} from '@phosphor-icons/react/dist/ssr/PencilSimple';
import {TrashIcon} from '@phosphor-icons/react/dist/ssr/Trash';
import type {Row} from '@tanstack/react-table';
import Link from 'next/link';

interface Action {
    label: string;
    onClick: () => void;
    shortcut?: string;
}

interface DeleteAction {
    label?: string;
    onClick: () => void;
    shortcut?: string;
}

interface DataTableRowActionsProps<TData> {
    actions?: Action[];
    deleteAction?: DeleteAction;
    detailsUrl?: string;
    editUrl?: string;
    row: Row<TData>;
}

export const DataTableRowActions = <TData,>({
    actions = [],
    children,
    deleteAction,
    detailsUrl,
    editUrl
}: React.PropsWithChildren<DataTableRowActionsProps<TData>>) => {
    return (
        <div className="flex flex-row space-x-2 justify-end">
            {children}
            {(actions.length > 0 || deleteAction) && (
                <Menu>
                    <MenuTrigger
                        render={
                            <Button
                                variant="outline"
                                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                            >
                                <DotsThreeIcon weight="bold" />
                                <span className="sr-only">{t('Open menu')}</span>
                            </Button>
                        }
                    />
                    <MenuPopup positionAlign="end" className="w-[160px]">
                        {actions.map(action => (
                            <MenuItem key={action.label} onClick={action.onClick}>
                                {action.label}
                                {action.shortcut && <MenuShortcut>{action.shortcut}</MenuShortcut>}
                            </MenuItem>
                        ))}
                        {deleteAction && actions.length > 0 && <MenuSeparator />}
                        {deleteAction && (
                            <MenuItem onClick={deleteAction.onClick} variant="destructive">
                                <TrashIcon />
                                {deleteAction.label || t('Delete')}
                                {deleteAction.shortcut && (
                                    <MenuShortcut>{deleteAction.shortcut}</MenuShortcut>
                                )}
                            </MenuItem>
                        )}
                    </MenuPopup>
                </Menu>
            )}
            {editUrl && (
                <Link href={editUrl}>
                    <Button variant="outline" size="sm">
                        <PencilSimpleIcon />
                        <span className="sr-only">{t('Edit')}</span>
                    </Button>
                </Link>
            )}
            {detailsUrl && (
                <Link href={detailsUrl}>
                    <Button variant="secondary" size="sm">
                        <ArrowRightIcon />
                        <span className="sr-only">{t('View')}</span>
                    </Button>
                </Link>
            )}
        </div>
    );
};
