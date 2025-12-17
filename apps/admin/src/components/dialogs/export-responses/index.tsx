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
import {zodResolver} from '@hookform/resolvers/zod';
import {BracketsCurlyIcon} from '@phosphor-icons/react/dist/ssr/BracketsCurly';
import {DownloadSimpleIcon} from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import {FileCsvIcon} from '@phosphor-icons/react/dist/ssr/FileCsv';
import {FileXlsIcon} from '@phosphor-icons/react/dist/ssr/FileXls';
import type {ColumnFiltersState, PaginationState} from '@tanstack/react-table';
import {saveAs} from 'file-saver';
import {useCallback, useState} from 'react';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {DEFAULT_CODED_ANSWER_DELIMITER} from '@/lib/schemas/constants';
import {type ResponsesExport, responsesExportSchema} from '@/lib/schemas/exports';
import ExportResponsesAnswerControls from './answer-controls';
import ExportResponsesFieldSelector from './field-selector';
import ExportResponsesFiltersControls from './filters-controls';

interface Props {
    filters: ColumnFiltersState;
    pagination: PaginationState;
    surveyId: string;
}

const ExportResponsesDialog: React.FC<Props> = ({filters, surveyId}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const methods = useForm<ResponsesExport>({
        resolver: zodResolver(responsesExportSchema),
        defaultValues: {
            fields: [],
            format: 'csv',
            applyActiveFilters: true,
            includeAllFields: true,
            includeAnswers: false,
            includeAllAnswerFields: true,
            answerFields: [],
            codedAnswerDelimiter: DEFAULT_CODED_ANSWER_DELIMITER,
            useCustomDelimiter: false
        }
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) methods.reset();
    };

    const handleFormSubmit: SubmitHandler<ResponsesExport> = useCallback(async () => {
        setIsExporting(true);
        const {
            format,
            includeAllFields,
            fields,
            applyActiveFilters,
            includeAnswers,
            includeAllAnswerFields,
            answerFields,
            codedAnswerDelimiter,
            useCustomDelimiter
        } = methods.getValues();

        try {
            // transform filters to match API schema
            const transformedFilters = applyActiveFilters
                ? filters.map(filter => ({
                      id: filter.id,
                      value: Array.isArray(filter.value) ? filter.value : [filter.value]
                  }))
                : [];

            const response = await fetch(`/api/surveys/${surveyId}/responses/export`, {
                body: JSON.stringify({
                    format,
                    fields: includeAllFields ? 'all' : fields,
                    filters: transformedFilters,
                    includeAnswers,
                    answerFields: includeAllAnswerFields ? 'all' : answerFields,
                    codedAnswerDelimiter,
                    useCustomDelimiter
                }),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const filename = `survey-responses-${surveyId}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
            saveAs(blob, filename);
            setIsOpen(false);
            toast.success('Export successful');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Export failed');
        } finally {
            setIsExporting(false);
        }
    }, [filters, methods.getValues, surveyId]);

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger
                render={
                    <Button variant="outline">
                        <DownloadSimpleIcon />
                        Export responses
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
                            <SheetTitle>Export responses</SheetTitle>
                            <SheetDescription>
                                Choose the format and fields to export your survey responses.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="px-4 flex-grow overflow-auto">
                            <div className="grid gap-3">
                                <FormField
                                    control={methods.control}
                                    fieldType="select"
                                    label="Format"
                                    name="format"
                                    options={[
                                        {
                                            description: 'Commonly used format for data exchange',
                                            icon: FileCsvIcon,
                                            label: 'CSV',
                                            value: 'csv'
                                        },
                                        {
                                            description: 'Commonly used for API integrations',
                                            icon: BracketsCurlyIcon,
                                            label: 'JSON',
                                            value: 'json'
                                        },
                                        {
                                            description: 'Commonly used for data analysis',
                                            icon: FileXlsIcon,
                                            label: 'Excel',
                                            value: 'excel'
                                        }
                                    ]}
                                />
                                <FormField
                                    control={methods.control}
                                    description="Fields will include timestamps and any metadata recorded."
                                    fieldType="switch"
                                    label="Include all fields"
                                    name="includeAllFields"
                                />
                                <ExportResponsesFieldSelector />
                                <FormField
                                    control={methods.control}
                                    description="Include individual question answers in the export. This will create multiple rows per response (one for each answer)."
                                    fieldType="switch"
                                    label="Include answers"
                                    name="includeAnswers"
                                />
                                <ExportResponsesAnswerControls />
                                <ExportResponsesFiltersControls filters={filters} />
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
                                        Cancel
                                    </Button>
                                }
                            />
                            <Button className="flex-grow" pending={isExporting} type="submit">
                                <DownloadSimpleIcon />
                                Export
                            </Button>
                        </SheetFooter>
                    </form>
                </FormProvider>
            </SheetPopup>
        </Sheet>
    );
};

export default ExportResponsesDialog;
