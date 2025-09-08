'use client';

import {use} from 'react';
import {useFormContext} from 'react-hook-form';
import {FormFieldContext, FormItemContext} from './context';

const useFormField = () => {
    const {getFieldState, formState} = useFormContext();
    const fieldContext = use(FormFieldContext);

    if (!fieldContext) {
        throw new Error('useFormField should be used within <FormField>');
    }

    const fieldState = getFieldState(fieldContext.name, formState);
    const itemContext = use(FormItemContext);
    const {id} = itemContext;

    return {
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        id,
        name: fieldContext.name,
        ...fieldState
    };
};

export default useFormField;
