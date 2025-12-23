'use client';

import {FormField} from '@glint/form/fields';
import Input from '@glint/form/input';
import {LABEL_CLASSNAME} from '@glint/form/label';
import Button from '@glint/ui/button';
import ToggleVisibility from '@glint/ui/toggle-visibility';
import {XIcon} from '@phosphor-icons/react/dist/ssr/X';
import clsx from 'clsx';
import {useWatch} from 'react-hook-form';
import type {FilterForm} from './types';

interface Props {
    filterValues: {
        cities: Array<{label: string; value: string}>;
        countries: Array<{label: string; value: string}>;
        genders: Array<{label: string; value: string}>;
        surveys: Array<{label: string; value: string}>;
    };
    handleClearField: (fieldName: keyof FilterForm) => void;
    methods: {
        control: any;
    };
}

const Filters: React.FC<Props> = ({filterValues, handleClearField, methods}) => {
    const ageFilterType = useWatch({control: methods.control, name: 'age.type'});
    const gender = useWatch({control: methods.control, name: 'gender'});
    const locationCity = useWatch({control: methods.control, name: 'locationCity'});
    const locationCountry = useWatch({control: methods.control, name: 'locationCountry'});
    const survey = useWatch({control: methods.control, name: 'survey'});

    return (
        <div className="grid gap-4">
            <div className="flex flex-row items-center gap-2">
                <label className={clsx([LABEL_CLASSNAME, 'w-3/12'])} htmlFor="age.type">
                    Age
                </label>
                <div className="w-2/12">
                    <FormField<FilterForm>
                        control={methods.control}
                        fieldType="select"
                        name="age.type"
                        options={[
                            {label: 'Equal', value: 'equal'},
                            {label: 'Between', value: 'between'},
                            {label: 'Over', value: 'over'},
                            {label: 'Under', value: 'under'}
                        ]}
                        placeholder="Select age filter type"
                    />
                </div>
                <div className="w-full">
                    <ToggleVisibility
                        visible={
                            ageFilterType === 'equal' ||
                            ageFilterType === 'over' ||
                            ageFilterType === 'under'
                        }
                    >
                        <FormField<FilterForm>
                            control={methods.control}
                            name="age.value"
                            render={({field}) => {
                                const value = typeof field.value === 'string' ? field.value : '';
                                return (
                                    <Input
                                        onChange={e => field.onChange(e.target.value)}
                                        placeholder="Enter age"
                                        type="number"
                                        value={value}
                                    />
                                );
                            }}
                        />
                    </ToggleVisibility>
                    <ToggleVisibility visible={ageFilterType === 'between'}>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField<FilterForm>
                                control={methods.control}
                                name="age.min"
                                render={({field}) => {
                                    const value =
                                        typeof field.value === 'string' ? field.value : '';
                                    return (
                                        <Input
                                            onChange={e => field.onChange(e.target.value)}
                                            placeholder="Min age"
                                            type="number"
                                            value={value}
                                        />
                                    );
                                }}
                            />
                            <FormField<FilterForm>
                                control={methods.control}
                                name="age.max"
                                render={({field}) => {
                                    const value =
                                        typeof field.value === 'string' ? field.value : '';
                                    return (
                                        <Input
                                            onChange={e => field.onChange(e.target.value)}
                                            placeholder="Max age"
                                            type="number"
                                            value={value}
                                        />
                                    );
                                }}
                            />
                        </div>
                    </ToggleVisibility>
                </div>
                <div className="w-[50px]">
                    <Button
                        disabled={!ageFilterType}
                        onClick={() => handleClearField('age')}
                        size="sm"
                        type="button"
                        variant="destructiveGhost"
                    >
                        <XIcon />
                    </Button>
                </div>
            </div>
            <div className="flex flex-row items-center gap-2">
                <label className={clsx([LABEL_CLASSNAME, 'w-3/12'])} htmlFor="genderQualifier">
                    Gender
                </label>
                <div className="w-2/12">
                    <FormField<FilterForm>
                        control={methods.control}
                        fieldType="select"
                        name="genderQualifier"
                        options={[
                            {label: 'Is', value: 'is'},
                            {label: 'Is not', value: 'is_not'}
                        ]}
                    />
                </div>
                <div className="w-full">
                    <FormField<FilterForm>
                        control={methods.control}
                        fieldProps={{multiple: true}}
                        fieldType="select"
                        name="gender"
                        options={[{label: 'Any gender', value: ''}, ...filterValues.genders]}
                    />
                </div>
                <div className="w-[50px]">
                    <Button
                        disabled={gender?.length === 0}
                        onClick={() => handleClearField('gender')}
                        size="sm"
                        type="button"
                        variant="destructiveGhost"
                    >
                        <XIcon />
                    </Button>
                </div>
            </div>
            <div className="flex flex-row items-center gap-2">
                <label
                    className={clsx([LABEL_CLASSNAME, 'w-3/12'])}
                    htmlFor="locationCityQualifier"
                >
                    Location city
                </label>
                <div className="w-2/12">
                    <FormField<FilterForm>
                        control={methods.control}
                        fieldType="select"
                        name="locationCityQualifier"
                        options={[
                            {label: 'Is', value: 'is'},
                            {label: 'Is not', value: 'is_not'}
                        ]}
                    />
                </div>
                <div className="w-full">
                    <FormField<FilterForm>
                        control={methods.control}
                        fieldProps={{multiple: true}}
                        fieldType="select"
                        name="locationCity"
                        options={[{label: 'Any city', value: ''}, ...filterValues.cities]}
                    />
                </div>
                <div className="w-[50px]">
                    <Button
                        disabled={locationCity?.length === 0}
                        onClick={() => handleClearField('locationCity')}
                        size="sm"
                        type="button"
                        variant="destructiveGhost"
                    >
                        <XIcon />
                    </Button>
                </div>
            </div>
            <div className="flex flex-row items-center gap-2">
                <label
                    className={clsx([LABEL_CLASSNAME, 'w-3/12'])}
                    htmlFor="locationCountryQualifier"
                >
                    Location country
                </label>
                <div className="w-2/12">
                    <FormField<FilterForm>
                        control={methods.control}
                        fieldType="select"
                        name="locationCountryQualifier"
                        options={[
                            {label: 'Is', value: 'is'},
                            {label: 'Is not', value: 'is_not'}
                        ]}
                    />
                </div>
                <div className="w-full">
                    <FormField<FilterForm>
                        control={methods.control}
                        fieldProps={{multiple: true}}
                        fieldType="select"
                        name="locationCountry"
                        options={[{label: 'Any country', value: ''}, ...filterValues.countries]}
                    />
                </div>
                <div className="w-[50px]">
                    <Button
                        disabled={locationCountry?.length === 0}
                        onClick={() => handleClearField('locationCountry')}
                        size="sm"
                        type="button"
                        variant="destructiveGhost"
                    >
                        <XIcon />
                    </Button>
                </div>
            </div>
            <div className="flex flex-row items-center gap-2">
                <label className={clsx([LABEL_CLASSNAME, 'w-3/12'])} htmlFor="surveyQualifier">
                    Survey
                </label>
                <div className="w-2/12">
                    <FormField<FilterForm>
                        control={methods.control}
                        fieldType="select"
                        name="surveyQualifier"
                        options={[
                            {label: 'Is', value: 'is'},
                            {label: 'Is not', value: 'is_not'}
                        ]}
                    />
                </div>
                <div className="w-full">
                    <FormField<FilterForm>
                        control={methods.control}
                        fieldProps={{multiple: true}}
                        fieldType="select"
                        name="survey"
                        options={[{label: 'Any survey', value: ''}, ...filterValues.surveys]}
                    />
                </div>
                <div className="w-[50px]">
                    <Button
                        disabled={survey?.length === 0}
                        onClick={() => handleClearField('survey')}
                        size="sm"
                        type="button"
                        variant="destructiveGhost"
                    >
                        <XIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Filters;
