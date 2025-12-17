'use client';

import Input from '@glint/form/input';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {Card, CardContent} from '@glint/ui/card';
import {
    Dialog,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle,
    DialogTrigger
} from '@glint/ui/dialog';
import {zodResolver} from '@hookform/resolvers/zod';
import {TrashIcon} from '@phosphor-icons/react/dist/ssr/Trash';
import {UploadSimpleIcon} from '@phosphor-icons/react/dist/ssr/UploadSimple';
import {useCallback, useState} from 'react';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {type ImportQuestions, importQuestionsSchema, type Question} from '@/lib/schemas/questions';

interface Props {
    onImport: (questions: Question[]) => void;
    surveyId: string;
}

const ImportQuestionsDialog: React.FC<Props> = ({onImport, surveyId}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const methods = useForm<ImportQuestions>({
        resolver: zodResolver(importQuestionsSchema),
        defaultValues: {file: null, surveyId},
        mode: 'onChange'
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            methods.reset();
            setSelectedFile(null);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            methods.setValue('file', file, {shouldValidate: true});
        } else {
            setSelectedFile(null);
            methods.setValue('file', null, {shouldValidate: true});
        }
    };

    const handleFormSubmit: SubmitHandler<ImportQuestions> = useCallback(
        async data => {
            if (!data.file) {
                toast.error('Please select a file to import');
                return;
            }

            setIsImporting(true);
            try {
                const formData = new FormData();
                formData.append('file', data.file);

                const response = await fetch(`/api/surveys/${surveyId}/questions/import`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Import failed');
                }

                const result = await response.json();
                toast.success(`Successfully imported ${result.importedCount} questions`);
                if (result.warnings && result.warnings.length > 0) {
                    toast.warning(`Import completed with warnings: ${result.warnings.join(', ')}`);
                }
                setIsOpen(false);
                setSelectedFile(null);
                onImport(result.questions);
                setIsImporting(false);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Import failed');
                setIsImporting(false);
            }
        },
        [surveyId, onImport]
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={
                    <Button>
                        <UploadSimpleIcon />
                        Import questions
                    </Button>
                }
            />
            <DialogPopup className="w-[400px] sm:w-[540px] !max-w-none">
                <FormProvider {...methods}>
                    <form
                        className="flex flex-col flex-1 max-h-full"
                        onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}
                    >
                        <DialogHeader className="sticky top-0 bg-white/70 backdrop-blur-lg">
                            <DialogTitle>Import questions</DialogTitle>
                            <DialogDescription>
                                Upload a CSV or XLSX file with your survey questions. Our AI will
                                automatically convert them to the correct format.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-grow overflow-auto">
                            <div className="grid gap-6 py-4">
                                {selectedFile ? (
                                    <div className="animate-in fade-in-0 duration-300">
                                        <div className="mb-2 text-sm font-medium">
                                            Selected File
                                        </div>
                                        <div className="p-3 border rounded-md bg-muted/50 flex items-center gap-2">
                                            <div className="flex-grow">
                                                <p className="text-sm font-medium">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Size: {(selectedFile.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => setSelectedFile(null)}
                                                size="sm"
                                                variant="destructive"
                                            >
                                                <TrashIcon />
                                                Remove File
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="file-upload"
                                            className="text-sm font-medium inline-block"
                                        >
                                            Upload File
                                        </label>
                                        <Input
                                            accept=".csv,.xlsx,.xls"
                                            className="cursor-pointer w-auto hover:bg-muted/50 transition-colors duration-200"
                                            id="file-upload"
                                            onChange={handleFileChange}
                                            type="file"
                                        />
                                        {methods.formState.errors.file && (
                                            <p className="text-xs text-red-600">
                                                {methods.formState.errors.file.message?.toString()}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Supported formats: CSV, XLSX. The file should contain
                                            headers and at least one row of data.
                                        </p>
                                    </div>
                                )}
                                <Card>
                                    <CardContent>
                                        <div className="text-sm font-medium">How it works</div>
                                        <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                                            <li>Upload your CSV or XLSX file with questions</li>
                                            <li>
                                                Our AI will analyse the file structure and convert
                                                it to our format
                                            </li>
                                            <li>
                                                Questions will be added to your survey in the
                                                correct order
                                            </li>
                                            <li>
                                                You'll receive warnings if any data couldn't be
                                                converted
                                            </li>
                                        </ol>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                        <DialogFooter className="sticky bottom-0 bg-white/70 backdrop-blur-lg">
                            <DialogClose
                                render={
                                    <Button disabled={isImporting} variant="accent">
                                        Cancel
                                    </Button>
                                }
                            />
                            <Button
                                type="submit"
                                disabled={!selectedFile || isImporting}
                                pending={isImporting}
                            >
                                <UploadSimpleIcon />
                                Import Questions
                            </Button>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogPopup>
        </Dialog>
    );
};

export default ImportQuestionsDialog;
