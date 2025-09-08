import {atom} from 'jotai';

export interface BreadcrumbItem {
    href?: string;
    label: string;
}

export const breadcrumbsAtom = atom<BreadcrumbItem[]>([]);

export const removeQuestionIndexAtom = atom<number | null>(null);
export const questionCountAtom = atom<number>(0);

export const highlightsAtom = atom<Record<string, number>>({});

export const formDialogStateAtom = atom<{
    handleSubmit: () => void;
    isPending: boolean;
    wasSuccessul: boolean;
}>({
    handleSubmit: () => {},
    isPending: false,
    wasSuccessul: false
});
