'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {
    Sheet,
    SheetClose,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetPopup,
    SheetTitle,
    SheetTrigger
} from '@glint/ui/sheet';
import {useI18n} from '@/hooks/use-i18n';
import {zodResolver} from '@hookform/resolvers/zod';
import {BracketsCurlyIcon} from '@phosphor-icons/react/dist/ssr/BracketsCurly';
import {DownloadSimpleIcon} from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import {FileCsvIcon} from '@phosphor-icons/react/dist/ssr/FileCsv';
import {FileXlsIcon} from '@phosphor-icons/react/dist/ssr/FileXls';
import {saveAs} from 'file-saver';
import {useCallback, useState} from 'react';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import ExportQuestionsFieldSelector from '@/components/question-editor/export-field-selector';
import {type QuestionsExport, questionsExportSchema} from '@/lib/schemas/questions';

interface Props {
    surveyId: string;
}

const ImportQuestionsDialog: React.FC<Props> = ({surveyId}) => {
    const {t} = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const methods = useForm<QuestionsExport>({
        resolver: zodResolver(questionsExportSchema),
        defaultValues: {
            fields: [],
            format: 'csv',
            includeAllFields: true
        }
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) methods.reset();
    };

    const handleFormSubmit: SubmitHandler<QuestionsExport> = useCallback(async () => {
        setIsExporting(true);
        const {fields, format, includeAllFields} = methods.getValues();

        try {
            const endpoint =
                format === 'xlsform'
                    ? `/api/surveys/${surveyId}/questions/export/xlsform`
                    : `/api/surveys/${surveyId}/questions/export`;
            const response = await fetch(endpoint, {
                body: JSON.stringify({format, fields: includeAllFields ? 'all' : fields}),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(t('Export failed'));
            }

            const blob = await response.blob();
            const filename = `survey-questions-${surveyId}.${format === 'excel' || format === 'xlsform' ? 'xlsx' : format}`;
            saveAs(blob, filename);
            setIsOpen(false);
            toast.success(t('Export successful'));
        } catch (error) {
            console.error('Export error:', error);
            toast.error(t('Export failed'));
        } finally {
            setIsExporting(false);
        }
    }, [surveyId, methods.getValues]);

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger
                render={
                    <Button variant="secondary">
                        <DownloadSimpleIcon />
                        {t('Export questions')}
                    </Button>
                }
            />
            <SheetPopup className="w-[400px] sm:w-[540px] !max-w-none">
                <FormProvider {...methods}>
                    <form
                        className="flex flex-col flex-1 max-h-full"
                        onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}
                    >
                        <SheetHeader className="sticky top-0 bg-white/70 backdrop-blur-lg">
                            <SheetTitle>{t('Export Questions')}</SheetTitle>
                            <SheetDescription>
                                {t('Choose the format and fields to export your survey questions.')}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="px-4 flex-grow overflow-auto">
                            <div className="grid gap-3">
                                <FormField
                                    control={methods.control}
                                    fieldType="select"
                                    label={t('Format')}
                                    name="format"
                                    options={[
                                        {
                                            description: t(
                                                'Commonly used format for data exchange'
                                            ),
                                            icon: FileCsvIcon,
                                            label: 'CSV',
                                            value: 'csv'
                                        },
                                        {
                                            description: t('Commonly used for API integrations'),
                                            icon: BracketsCurlyIcon,
                                            label: 'JSON',
                                            value: 'json'
                                        },
                                        {
                                            description: t('Commonly used for data analysis'),
                                            icon: FileXlsIcon,
                                            label: 'Excel',
                                            value: 'excel'
                                        },
                                        {
                                            description: t('Commonly used for building ODK forms'),
                                            icon: FileXlsIcon,
                                            label: 'XLSForm',
                                            value: 'xlsform'
                                        }
                                    ]}
                                    placeholder={t('Select format')}
                                />
                                <FormField
                                    control={methods.control}
                                    description={t(
                                        'Fields will include timestamps and any metadata recorded.'
                                    )}
                                    fieldType="switch"
                                    label={t('Include all fields')}
                                    name="includeAllFields"
                                />
                                <ExportQuestionsFieldSelector />
                            </div>
                        </div>
                        <SheetFooter className="sticky bottom-0 bg-white/70 backdrop-blur-lg flex flex-row gap-2">
                            <SheetClose
                                render={
                                    <Button
                                        className="flex-grow"
                                        disabled={isExporting}
                                        variant="accent"
                                    >
                                        {t('Cancel')}
                                    </Button>
                                }
                            />
                            <Button className="flex-grow" pending={isExporting} type="submit">
                                <DownloadSimpleIcon />
                                {t('Export')}
                            </Button>
                        </SheetFooter>
                    </form>
                </FormProvider>
            </SheetPopup>
        </Sheet>
    );
};

export default ImportQuestionsDialog;
