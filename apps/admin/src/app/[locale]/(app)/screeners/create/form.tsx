'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {useCallback} from 'react';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {type ScreenerCreate, screenerCreateSchema} from '@/lib/schemas/screeners';
import {useTRPC} from '@/lib/trpc/react';
import ScreenerTypeFields from '../form-type-fields';

const Form: React.FC = () => {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const methods = useForm<ScreenerCreate>({
        resolver: zodResolver(screenerCreateSchema),
        defaultValues: {
            config: {operator: 'over', value: 18},
            description: '',
            name: '',
            type: 'age'
        }
    });

    const createScreener = useMutation(
        trpc.screeners.create.mutationOptions({
            onSuccess: async response => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.screeners.getAll.queryKey()
                });
                toast.success('Screener created successfully');
                router.push(`/screeners/${response?.id}`);
            }
        })
    );

    const handleFormSubmit: SubmitHandler<ScreenerCreate> = useCallback(
        async data => {
            await createScreener.mutateAsync(data);
        },
        [createScreener.mutateAsync]
    );

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}>
                <div className="grid gap-6">
                    <FormField<ScreenerCreate>
                        control={methods.control}
                        fieldType="input"
                        label="Name"
                        name="name"
                    />
                    <FormField<ScreenerCreate>
                        control={methods.control}
                        fieldProps={{rows: '2'}}
                        fieldType="textarea"
                        label="Description"
                        name="description"
                    />
                    <FormField<ScreenerCreate>
                        control={methods.control}
                        fieldType="radio-group"
                        label="Type"
                        name="type"
                        options={[
                            {label: 'Age', value: 'age'},
                            {label: 'Location', value: 'location'},
                            {label: 'Selection', value: 'selection'}
                        ]}
                    />
                    <ScreenerTypeFields />
                </div>
                <div className="flex justify-end">
                    <Button
                        className="mt-4"
                        pending={createScreener.status === 'pending'}
                        type="submit"
                    >
                        Submit
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

export default Form;
