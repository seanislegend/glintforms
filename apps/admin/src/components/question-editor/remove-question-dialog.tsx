'use client';

import Button from '@glint/ui/button';
import {
    Dialog,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle
} from '@glint/ui/dialog';
import {useAtom, useSetAtom} from 'jotai';
import {useFormContext, useWatch} from 'react-hook-form';
import {useI18n} from '@/hooks/use-i18n';
import {questionCountAtom, removeQuestionIndexAtom} from '@/lib/store';

interface DialogProps {
    onRemove: (index: number) => void;
}

interface ButtonProps extends DialogProps {
    questionIndex: number;
    onSuccess: () => void;
}

const RemoveQuestionButton: React.FC<ButtonProps> = ({questionIndex, onRemove, onSuccess}) => {
    const {t} = useI18n();
    const {setValue} = useFormContext();
    const question = useWatch({name: `questions.${questionIndex}`});
    const setQuestionCount = useSetAtom(questionCountAtom);

    const handleRemove = () => {
        setValue(`deletedQuestionIds.${question.id}`, true);
        onRemove(questionIndex);
        setQuestionCount(prev => prev - 1);
        onSuccess();
    };

    return (
        <Button onClick={handleRemove} variant="destructive">
            {t('Confirm')}
        </Button>
    );
};

const RemoveQuestionDialog: React.FC<DialogProps> = ({onRemove}) => {
    const {t} = useI18n();
    const [removeQuestionIndex, setRemoveQuestionIndex] = useAtom(removeQuestionIndexAtom);
    const isOpen = removeQuestionIndex !== null;

    return (
        <Dialog open={isOpen}>
            <DialogPopup>
                <DialogHeader>
                    <DialogTitle>{t('Remove question')}</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    {t('Are you sure you want to remove this question?')}
                </DialogDescription>
                <DialogFooter>
                    <DialogClose
                        render={
                            <Button onClick={() => setRemoveQuestionIndex(null)} variant="accent">
                                {t('Cancel')}
                            </Button>
                        }
                    />
                    {isOpen && (
                        <RemoveQuestionButton
                            questionIndex={removeQuestionIndex}
                            onRemove={onRemove}
                            onSuccess={() => setRemoveQuestionIndex(null)}
                        />
                    )}
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
};

export default RemoveQuestionDialog;
