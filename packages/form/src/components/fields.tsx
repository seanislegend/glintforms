'use client';

import {Field} from '@base-ui-components/react/field';
import Condition from '@glint/ui/condition';
import {cn} from '@glint/ui/utils';
import {useId} from 'react';
import type {ControllerProps, FieldError, FieldPath, FieldValues} from 'react-hook-form';
import {Controller} from 'react-hook-form';
import {FormFieldContext, FormItemContext} from '../hooks/context';
import useFormField from '../hooks/use-form-field';
import Checkbox from './checkbox';
import Input from './input';
import Label from './label';
import PasswordInput from './password-input';
import {RadioGroup, RadioGroupItem} from './radio-group';
import {
    Select,
    SelectItem,
    SelectItemText,
    SelectPopup,
    SelectTrigger,
    SelectValue
} from './select';
import Switch from './switch';
import Textarea from './textarea';

const fieldTypesWithInlineLabels: FormFieldProps['fieldType'][] = ['checkbox', 'switch'];

export const FormItem = ({className, ...props}: React.ComponentProps<'div'>) => {
    const id = useId();

    return (
        <FormItemContext.Provider value={{id}}>
            <Field.Root className={cn('space-y-2', className)} {...props} />
        </FormItemContext.Provider>
    );
};

export const FormLabel = ({className, ...props}: React.ComponentProps<typeof Label>) => {
    const {error} = useFormField();

    return <Label className={cn(error && 'text-destructive', className)} {...props} />;
};

export const FormControl = ({...props}: React.ComponentProps<'div'>) => {
    const {error, formItemId, formDescriptionId, formMessageId} = useFormField();

    return (
        <div
            id={formItemId}
            aria-describedby={
                !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`
            }
            aria-invalid={!!error}
            {...props}
        />
    );
};

export const FormDescription = ({className, ...props}: React.ComponentProps<'p'>) => {
    return <p className={cn('text-xs text-muted-foreground', className)} {...props} />;
};

export const FormError = ({error}: {error: FieldError | undefined}) => {
    if (!error) return null;
    return <p className="text-sm text-destructive">{error.message}</p>;
};

const wrapperWarnings = (
    hasWrappers: boolean,
    {label, description, message}: {label?: string; description?: string; message?: string}
) => {
    Object.entries({label, description, message}).forEach(([key, value]) => {
        if (value && !hasWrappers) {
            console.warn(
                `FormField: ${key} "${value}" provided but hasWrappers is false. The ${key} will not be rendered.`
            );
        }
    });
};

const getDefaultRender = (
    type: FormFieldProps['fieldType'],
    fieldProps: FormFieldProps['fieldProps'] = {},
    placeholder?: string,
    hasWrappers?: boolean,
    label?: string,
    description?: string,
    options?: {
        description?: string;
        icon?: React.ElementType;
        label: string;
        value: number | string;
    }[]
): ControllerProps<any, any>['render'] => {
    return ({field, fieldState}) => {
        const fieldElement = (() => {
            const sharedProps = {
                'aria-invalid': !!fieldState.error,
                ...fieldProps
            };

            switch (type) {
                case 'checkbox':
                    return <Checkbox {...sharedProps} {...field} {...fieldProps} />;
                case 'input':
                    return <Input {...sharedProps} placeholder={placeholder} {...field} />;
                case 'password-input':
                    return <PasswordInput {...sharedProps} placeholder={placeholder} {...field} />;
                case 'radio-group':
                    return (
                        <RadioGroup {...sharedProps}>
                            {options?.map(option => (
                                <div key={option.value} className="flex items-center gap-3">
                                    <RadioGroupItem
                                        {...field}
                                        onChange={field.onChange}
                                        value={option.value.toString()}
                                    />
                                    <Label htmlFor={option.value.toString()}>{option.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    );
                case 'select':
                    return (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-white w-full">
                                <SelectValue>
                                    <span className="flex items-center gap-2">
                                        {
                                            options?.find(option => option.value === field.value)
                                                ?.label
                                        }
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectPopup>
                                {options?.map(option => (
                                    <SelectItem key={option.value} value={option.value.toString()}>
                                        <span className="flex items-center gap-2">
                                            {option.icon && (
                                                <option.icon className="size-4 flex-shrink-0" />
                                            )}
                                            <SelectItemText>{option.label}</SelectItemText>
                                        </span>
                                        {option.description && (
                                            <FormDescription>{option.description}</FormDescription>
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectPopup>
                        </Select>
                    );
                case 'switch':
                    return (
                        <Switch
                            {...sharedProps}
                            {...field}
                            checked={field.value ?? false}
                            defaultChecked={field.value === true}
                            id={field.name}
                            onCheckedChange={field.onChange}
                        />
                    );
                case 'textarea':
                    return <Textarea {...sharedProps} placeholder={placeholder} {...field} />;
                default:
                    return <div>Unsupported field type</div>;
            }
        })();

        const hasInlineLabel = fieldTypesWithInlineLabels.includes(type);

        return (
            <>
                {hasWrappers && label && !hasInlineLabel && (
                    <FormLabel htmlFor={field.name}>{label}</FormLabel>
                )}
                <FormControl>
                    <Condition
                        condition={!!(hasWrappers && label && hasInlineLabel)}
                        wrapper={children => (
                            <div className="flex items-center gap-2">{children}</div>
                        )}
                    >
                        {fieldElement}
                        {hasWrappers && label && fieldTypesWithInlineLabels.includes(type) && (
                            <FormLabel htmlFor={field.name}>{label}</FormLabel>
                        )}
                    </Condition>
                </FormControl>
                {hasWrappers && description && <FormDescription>{description}</FormDescription>}
                <FormError error={fieldState.error} />
            </>
        );
    };
};

interface FormFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<ControllerProps<TFieldValues, TName>, 'render'> {
    description?: string;
    fieldProps?: Record<string, string>;
    fieldType?:
        | 'checkbox'
        | 'input'
        | 'password-input'
        | 'radio-group'
        | 'select'
        | 'switch'
        | 'textarea';
    hasWrappers?: boolean;
    label?: string;
    message?: string;
    options?: {
        description?: string;
        icon?: React.ElementType;
        label: string;
        value: number | string;
    }[];
    placeholder?: string;
    render?: ControllerProps<TFieldValues, TName>['render'];
}

export const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    description,
    fieldProps,
    fieldType,
    hasWrappers = true,
    label,
    message,
    options,
    placeholder,
    render,
    ...props
}: FormFieldProps<TFieldValues, TName>) => {
    wrapperWarnings(hasWrappers, {label, description, message});

    const finalRender: ControllerProps<TFieldValues, TName>['render'] = controllerProps => {
        // if custom render is provided, use it but wrap with label and error
        if (render) {
            const customContent = render(controllerProps);

            return (
                <>
                    {hasWrappers && label && !fieldTypesWithInlineLabels.includes(fieldType) && (
                        <FormLabel htmlFor={controllerProps.field.name}>{label}</FormLabel>
                    )}
                    {customContent}
                    {hasWrappers && description && <FormDescription>{description}</FormDescription>}
                    <FormError error={controllerProps.fieldState.error} />
                </>
            );
        }

        // otherwise use default render
        return getDefaultRender(
            fieldType,
            fieldProps,
            placeholder,
            hasWrappers,
            label,
            description,
            options
        )(controllerProps);
    };

    return (
        <FormItem data-field={props.name}>
            <FormFieldContext.Provider value={{name: props.name}}>
                <Controller {...props} render={finalRender} />
            </FormFieldContext.Provider>
        </FormItem>
    );
};
