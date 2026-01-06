'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {useCallback, useEffect, useMemo} from 'react';
import {FormProvider, type SubmitHandler, useForm, useWatch} from 'react-hook-form';
import {toast} from 'sonner';
import {type ScreenerCreate, screenerCreateSchema} from '@/lib/schemas/screeners';
import {useTRPC} from '@/lib/trpc/react';
import ScreenerTypeFields from '../../form-type-fields';

interface FormProps {
    screenerId: string;
}

const Form: React.FC<FormProps> = ({screenerId}) => {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const {data: screener, isLoading} = useQuery(trpc.screeners.get.queryOptions(screenerId));

    const methods = useForm<ScreenerCreate>({
        resolver: zodResolver(screenerCreateSchema),
        defaultValues: {
            config: {},
            description: '',
            name: '',
            type: 'age'
        }
    });

    const screenerType = useWatch({control: methods.control, name: 'type'});
    const hasLoadedScreener = useMemo(() => !!screener, [screener]);

    useEffect(() => {
        if (hasLoadedScreener) return;
        if (screenerType === 'age') {
            methods.setValue('config', {operator: 'over', value: 18}, {shouldValidate: false});
        } else if (screenerType === 'location') {
            methods.setValue('config', {countries: []}, {shouldValidate: false});
        } else if (screenerType === 'selection') {
            methods.setValue(
                'config',
                {
                    options: [{id: crypto.randomUUID(), passes: false, value: ''}],
                    question: ''
                },
                {shouldValidate: false}
            );
        }
    }, [screenerType, methods, hasLoadedScreener]);

    const updateScreener = useMutation(
        trpc.screeners.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.screeners.getAll.queryKey()
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.screeners.get.queryKey(screenerId)
                });
                toast.success('Screener updated successfully');
                router.replace(`/screeners/${screenerId}?success=true`);
            }
        })
    );

    const handleFormSubmit: SubmitHandler<ScreenerCreate> = useCallback(
        async data => {
            await updateScreener.mutateAsync({data, id: screenerId});
        },
        [updateScreener.mutateAsync, screenerId]
    );

    const defaultOptionIds = useMemo(() => {
        if (screener?.type === 'selection' && screener?.config) {
            return (
                screener.config as {options: Array<{id: string; passes: boolean; value: string}>}
            ).options.map(opt => ({id: opt.id, tempId: crypto.randomUUID()}));
        }
        return undefined;
    }, [screener]);

    useEffect(() => {
        if (screener) {
            methods.reset({
                config: screener?.config || {},
                description: screener?.description || '',
                name: screener?.name || '',
                type: screener?.type || 'age'
            } as ScreenerCreate);
        }
    }, [screener, methods]);

    if (isLoading) {
        return <div>Loading...</div>;
    } else if (!screener) {
        toast.error('Screener not found');
        router.replace('/screeners');
        return null;
    }

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
                    <ScreenerTypeFields defaultOptionIds={defaultOptionIds} />
                </div>
                <div className="flex justify-end">
                    <Button
                        className="mt-4"
                        pending={updateScreener.status === 'pending'}
                        type="submit"
                    >
                        Save changes
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

export default Form;
