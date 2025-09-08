'use client';

import {createContext} from 'react';
import type {FieldPath, FieldValues} from 'react-hook-form';

interface FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
    name: TName;
}

interface FormItemContextValue {
    id: string;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue);
