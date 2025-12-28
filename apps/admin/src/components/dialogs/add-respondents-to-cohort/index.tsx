'use client';

import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@glint/ui/card';
import {Sheet, SheetHeader, SheetPopup, SheetTitle, SheetTrigger} from '@glint/ui/sheet';
import Spacer from '@glint/ui/spacer';
import {zodResolver} from '@hookform/resolvers/zod';
import {PlusIcon} from '@phosphor-icons/react/dist/ssr/Plus';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useQueryState} from 'nuqs';
import {useCallback, useState} from 'react';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import useHighlight from '@/hooks/use-highlight';
import {useTRPC} from '@/lib/trpc/react';
import type {SearchResult} from './columns';
import Filters from './filters';
import {SearchResultsList} from './list';
import {type FilterForm, filterSchema} from './types';

const validGenderValues = ['female', 'male', 'other', 'prefer_not_to_say'] as const;

interface Props {
    cohortId: string;
}

const AddRespondentsToCohortSheet: React.FC<Props> = ({cohortId}) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [action, setAction] = useQueryState('action');
    const {data: filterValues, isLoading} = useQuery(
        trpc.respondents.getFilterValues.queryOptions()
    );
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const {highlight} = useHighlight();

    const isOpen = action === 'add';
    const defaultValues: FilterForm = {
        age: {type: '', value: '', min: '', max: ''},
        gender: [],
        genderQualifier: 'is',
        locationCity: [],
        locationCityQualifier: 'is',
        locationCountry: [],
        locationCountryQualifier: 'is',
        survey: [],
        surveyQualifier: 'is'
    };

    const methods = useForm<FilterForm>({
        resolver: zodResolver(filterSchema),
        defaultValues
    });

    const handleResetAll = useCallback(() => {
        methods.reset(defaultValues);
    }, [methods]);

    const handleClearField = useCallback(
        (fieldName: keyof FilterForm) => {
            if (fieldName === 'age') {
                methods.setValue('age', defaultValues.age);
            } else if (fieldName === 'gender') {
                methods.setValue('gender', []);
                methods.setValue('genderQualifier', 'is' as const);
            } else if (fieldName === 'locationCity') {
                methods.setValue('locationCity', []);
                methods.setValue('locationCityQualifier', 'is' as const);
            } else if (fieldName === 'locationCountry') {
                methods.setValue('locationCountry', []);
                methods.setValue('locationCountryQualifier', 'is' as const);
            } else if (fieldName === 'survey') {
                methods.setValue('survey', []);
                methods.setValue('surveyQualifier', 'is' as const);
            } else if (
                fieldName === 'genderQualifier' ||
                fieldName === 'locationCityQualifier' ||
                fieldName === 'locationCountryQualifier' ||
                fieldName === 'surveyQualifier'
            ) {
                methods.setValue(fieldName, 'is' as const);
            }
        },
        [methods]
    );

    const searchRespondents = useMutation(
        trpc.respondents.search.mutationOptions({
            onSuccess: data => {
                setSearchResults(data);
                if (data.length > 0) {
                    toast.success(`Found ${data.length} respondent${data.length !== 1 ? 's' : ''}`);
                } else {
                    toast.info('No respondents found');
                }
            },
            onError: error => {
                toast.error(error.message || 'Failed to search respondents');
                setSearchResults([]);
            }
        })
    );

    const addRespondentsToCohort = useMutation(
        trpc.cohorts.addRespondents.mutationOptions({
            onSuccess: async result => {
                const message =
                    result.skipped > 0
                        ? `Added ${result.added} respondent${result.added !== 1 ? 's' : ''}. ${result.skipped} already in cohort.`
                        : `Added ${result.added} respondent${result.added !== 1 ? 's' : ''} to cohort.`;
                toast.success(message);
                await queryClient.invalidateQueries({
                    queryKey: trpc.cohorts.get.queryKey(cohortId)
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.cohorts.getAll.queryKey()
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.cohorts.getRespondents.queryKey(cohortId)
                });
                setSearchResults([]);
                highlight('cohorts-respondents-list');
            },
            onError: error => {
                toast.error(error.message || 'Failed to add respondents to cohort');
            }
        })
    );

    const handleFormSubmit: SubmitHandler<FilterForm> = useCallback(
        async data => {
            const ageType = data.age?.type;
            const isValidAgeType =
                ageType === 'equal' ||
                ageType === 'between' ||
                ageType === 'over' ||
                ageType === 'under';

            const cleanData = {
                age:
                    isValidAgeType && data.age
                        ? {
                              max: data.age.max && data.age.max !== '' ? data.age.max : undefined,
                              min: data.age.min && data.age.min !== '' ? data.age.min : undefined,
                              type: ageType,
                              value:
                                  data.age.value && data.age.value !== ''
                                      ? data.age.value
                                      : undefined
                          }
                        : undefined,
                excludeCohortId: cohortId,
                gender: (() => {
                    const filtered = data.gender?.filter(
                        (value): value is (typeof validGenderValues)[number] =>
                            value !== '' &&
                            validGenderValues.includes(value as (typeof validGenderValues)[number])
                    );
                    return filtered && filtered.length > 0 && data.genderQualifier
                        ? filtered.map(value => ({
                              qualifier: data.genderQualifier as 'is' | 'is_not',
                              value: value as (typeof validGenderValues)[number]
                          }))
                        : undefined;
                })(),
                locationCity: (() => {
                    const filtered = data.locationCity?.filter(value => value !== '');
                    return filtered && filtered.length > 0 && data.locationCityQualifier
                        ? filtered.map(value => ({
                              qualifier: data.locationCityQualifier as 'is' | 'is_not',
                              value
                          }))
                        : undefined;
                })(),
                locationCountry: (() => {
                    const filtered = data.locationCountry?.filter(value => value !== '');
                    return filtered && filtered.length > 0 && data.locationCountryQualifier
                        ? filtered.map(value => ({
                              qualifier: data.locationCountryQualifier as 'is' | 'is_not',
                              value
                          }))
                        : undefined;
                })(),
                survey: (() => {
                    const filtered = data.survey?.filter(value => value !== '');
                    return filtered && filtered.length > 0 && data.surveyQualifier
                        ? filtered.map(value => ({
                              qualifier: data.surveyQualifier as 'is' | 'is_not',
                              value
                          }))
                        : undefined;
                })()
            };

            await searchRespondents.mutateAsync(cleanData);
        },
        [cohortId, searchRespondents]
    );

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (open) {
                setAction('add');
            } else {
                setAction(null);
                setSearchResults([]);
            }
        },
        [setAction]
    );

    if (isLoading || !filterValues) {
        return (
            <Sheet onOpenChange={handleOpenChange} open={isOpen}>
                <SheetTrigger
                    render={
                        <Button disabled={true} variant="secondary">
                            <PlusIcon />
                            Add respondents
                        </Button>
                    }
                />
                <SheetPopup className="w-[400px] sm:w-[800px] xl:w-[1000px] max-w-none sm:max-w-none xl:max-w-none">
                    <SheetHeader>
                        <SheetTitle>Add respondents to cohort</SheetTitle>
                    </SheetHeader>
                    <div className="p-4">
                        <div className="text-sm text-muted-foreground">Loading...</div>
                    </div>
                </SheetPopup>
            </Sheet>
        );
    }

    return (
        <Sheet onOpenChange={handleOpenChange} open={isOpen}>
            <SheetTrigger render={<Button variant="secondary" />}>
                <PlusIcon />
                Add respondents
            </SheetTrigger>
            <SheetPopup className="w-[400px] sm:w-[800px] xl:w-[1000px] max-w-none sm:max-w-none xl:max-w-none">
                <SheetHeader className="sticky top-0 bg-white/70 backdrop-blur-lg">
                    <SheetTitle>Add respondents to cohort</SheetTitle>
                </SheetHeader>
                <div className="px-4 flex-grow overflow-auto">
                    <FormProvider {...methods}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Filters</CardTitle>
                                <CardDescription>
                                    Filter the respondents to add to the cohort. Only respondents
                                    that don't already exist in the cohort and match all filters
                                    will be added.
                                </CardDescription>
                            </CardHeader>
                            <form
                                className="flex flex-col"
                                onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}
                            >
                                <CardContent>
                                    <Filters
                                        filterValues={filterValues}
                                        handleClearField={handleClearField}
                                        methods={methods}
                                    />
                                </CardContent>
                                <CardFooter className="flex items-center justify-end gap-2 mt-8">
                                    <Button
                                        onClick={handleResetAll}
                                        type="button"
                                        variant="secondary"
                                    >
                                        Reset all
                                    </Button>
                                    <Button
                                        pending={searchRespondents.status === 'pending'}
                                        type="submit"
                                    >
                                        Search
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </FormProvider>
                    <Spacer />
                    <SearchResultsList
                        addRespondentsToCohort={addRespondentsToCohort}
                        cohortId={cohortId}
                        searchResults={searchResults}
                    />
                </div>
            </SheetPopup>
        </Sheet>
    );
};

export default AddRespondentsToCohortSheet;
