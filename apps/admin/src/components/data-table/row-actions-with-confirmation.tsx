'use client';

import Button from '@glint/ui/button';
import {Menu, MenuItem, MenuPopup, MenuSeparator, MenuShortcut, MenuTrigger} from '@glint/ui/menu';
import {ArrowRightIcon} from '@phosphor-icons/react/dist/ssr/ArrowRight';
import {DotsThreeIcon} from '@phosphor-icons/react/dist/ssr/DotsThree';
import {PencilSimpleIcon} from '@phosphor-icons/react/dist/ssr/PencilSimple';
import type {Row} from '@tanstack/react-table';
import Link from '@glint/ui/link';
import {useState} from 'react';
import ConfirmationDialog from '@/components/dialogs/confirmation';
import {useI18n} from '@/hooks/use-i18n';

interface Action {
    label: string;
    onClick: () => void;
    shortcut?: string;
    requiresConfirmation?: boolean;
    confirmationTitle?: string;
    confirmationDescription?: string;
}

interface DeleteAction {
    label?: string;
    onClick: () => void;
    shortcut?: string;
    confirmationTitle?: string;
    confirmationDescription?: string;
}

interface DataTableRowActionsProps<TData> {
    actions?: Action[];
    deleteAction?: DeleteAction;
    detailsUrl?: string;
    editUrl?: string;
    row: Row<TData>;
}

export const DataTableRowActionsWithConfirmation = <TData,>({
    actions = [],
    children,
    deleteAction,
    detailsUrl,
    editUrl
}: React.PropsWithChildren<DataTableRowActionsProps<TData>>) => {
    const {t} = useI18n();
    const [confirmAction, setConfirmAction] = useState<{
        action: () => void;
        title: string;
        description: string;
        variant: 'default' | 'destructive';
    } | null>(null);

    const handleAction = (action: Action) => {
        if (action.requiresConfirmation) {
            setConfirmAction({
                action: action.onClick,
                title: action.confirmationTitle || t('Confirm action'),
                description:
                    action.confirmationDescription ||
                    t('Are you sure you want to perform this action?'),
                variant: 'default'
            });
        } else {
            action.onClick();
        }
    };

    const handleDeleteAction = () => {
        if (deleteAction) {
            setConfirmAction({
                action: deleteAction.onClick,
                title: deleteAction.confirmationTitle || t('Confirm delete'),
                description:
                    deleteAction.confirmationDescription ||
                    t('Are you sure you want to delete this item? This action cannot be undone'),
                variant: 'destructive'
            });
        }
    };

    return (
        <>
            <div className="flex flex-row space-x-2 justify-end">
                {children}
                {actions.length > 0 && (
                    <Menu>
                        <MenuTrigger
                            render={
                                <Button
                                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                                    variant="outline"
                                >
                                    <DotsThreeIcon weight="bold" />
                                    <span className="sr-only">{t('Open menu')}</span>
                                </Button>
                            }
                        />
                        <MenuPopup className="w-[160px]" positionAlign="end">
                            {actions.map(action => (
                                <MenuItem key={action.label} onClick={() => handleAction(action)}>
                                    {action.label}
                                    {action.shortcut && (
                                        <MenuShortcut>{action.shortcut}</MenuShortcut>
                                    )}
                                </MenuItem>
                            ))}
                            {deleteAction && actions.length > 0 && <MenuSeparator />}
                            {deleteAction && (
                                <MenuItem onClick={handleDeleteAction} variant="destructive">
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
                        <Button variant="outline" size="sm">
                            <ArrowRightIcon />
                            <span className="sr-only">{t('View')}</span>
                        </Button>
                    </Link>
                )}
            </div>
            <ConfirmationDialog
                open={confirmAction !== null}
                onOpenChange={open => !open && setConfirmAction(null)}
                title={confirmAction?.title || ''}
                description={confirmAction?.description || ''}
                variant={confirmAction?.variant || 'default'}
                onConfirm={() => {
                    confirmAction?.action();
                    setConfirmAction(null);
                }}
            />
        </>
    );
};
