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
import {useTRPC} from '@/lib/trpc/react';
import type {SearchResult} from './columns';
import Filters from './filters';
import {SearchResultsList} from './list';
import {type FilterForm, filterSchema} from './types';

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

    const isOpen = action === 'add';
    const defaultValues: FilterForm = {
        age: {type: '', value: '', min: '', max: ''},
        gender: '',
        genderQualifier: 'is',
        locationCity: '',
        locationCityQualifier: 'is',
        locationCountry: '',
        locationCountryQualifier: 'is',
        survey: '',
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
                methods.setValue('gender', defaultValues.gender);
                methods.setValue('genderQualifier', 'is' as const);
            } else if (fieldName === 'locationCity') {
                methods.setValue('locationCity', defaultValues.locationCity);
                methods.setValue('locationCityQualifier', 'is' as const);
            } else if (fieldName === 'locationCountry') {
                methods.setValue('locationCountry', defaultValues.locationCountry);
                methods.setValue('locationCountryQualifier', 'is' as const);
            } else if (fieldName === 'survey') {
                methods.setValue('survey', defaultValues.survey);
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
                toast.success(`Found ${data.length} respondent${data.length !== 1 ? 's' : ''}`);
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
            },
            onError: error => {
                toast.error(error.message || 'Failed to add respondents to cohort');
            }
        })
    );

    const handleFormSubmit: SubmitHandler<FilterForm> = useCallback(
        async data => {
            // filter out empty strings
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
                gender: data.gender && data.gender !== '' ? data.gender : undefined,
                genderQualifier:
                    data.gender && data.gender !== '' ? data.genderQualifier : undefined,
                locationCity:
                    data.locationCity && data.locationCity !== '' ? data.locationCity : undefined,
                locationCityQualifier:
                    data.locationCity && data.locationCity !== ''
                        ? data.locationCityQualifier
                        : undefined,
                locationCountry:
                    data.locationCountry && data.locationCountry !== ''
                        ? data.locationCountry
                        : undefined,
                locationCountryQualifier:
                    data.locationCountry && data.locationCountry !== ''
                        ? data.locationCountryQualifier
                        : undefined,
                survey: data.survey && data.survey !== '' ? data.survey : undefined,
                surveyQualifier:
                    data.survey && data.survey !== '' ? data.surveyQualifier : undefined
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
                        <Button variant="secondary">
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
            <SheetTrigger
                render={() => (
                    <Button variant="secondary">
                        <PlusIcon />
                        Add respondents
                    </Button>
                )}
            />
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
