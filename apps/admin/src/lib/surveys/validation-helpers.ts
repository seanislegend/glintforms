import {v7 as uuid} from 'uuid';
import type {ValidationRule, ValidationRuleType} from '@/lib/schemas/questions';
import {validationRuleConfigs} from '@/lib/schemas/questions';

export const createValidationRule = (
    type: ValidationRuleType,
    value?: string | number | boolean,
    message?: string
): ValidationRule => {
    const config = validationRuleConfigs[type];
    return {
        id: uuid(),
        type,
        value,
        message: message || config.defaultMessage,
        enabled: true
    };
};

export const getValidationSummary = (validations: ValidationRule[]): string => {
    if (validations.length === 0) {
        /* i18n */
        return 'No validation rules';
    }

    const enabledValidations = validations.filter(v => v.enabled);
    if (enabledValidations.length === 0) {
        /* i18n */
        return 'All rules disabled';
    }

    const ruleNames = enabledValidations
        .filter(v => v.type)
        // biome-ignore lint/style/noNonNullAssertion: wip
        .map(v => validationRuleConfigs[v.type!].label);
    return ruleNames.join(', ');
};

export const validateField = (value: string, validations: ValidationRule[]): string[] => {
    const errors: string[] = [];

    for (const validation of validations) {
        if (!validation.enabled) continue;

        switch (validation.type) {
            case 'minLength':
                if (validation.value && typeof validation.value === 'number') {
                    if (value.length < validation.value) {
                        errors.push(
                            validation.message ||
                                /* i18n */ `Must be at least ${validation.value} characters`
                        );
                    }
                }
                break;
            case 'maxLength':
                if (validation.value && typeof validation.value === 'number') {
                    if (value.length > validation.value) {
                        errors.push(
                            validation.message ||
                                /* i18n */ `Must be no more than ${validation.value} characters`
                        );
                    }
                }
                break;
            case 'email': {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    errors.push(validation.message || /* i18n */ 'Must be a valid email address');
                }
                break;
            }
            case 'url':
                try {
                    new URL(value);
                } catch {
                    if (value) {
                        errors.push(validation.message || /* i18n */ 'Must be a valid URL');
                    }
                }
                break;
            case 'min':
                if (validation.value && typeof validation.value === 'number') {
                    if (Number(value) < validation.value) {
                        errors.push(
                            validation.message || /* i18n */ `Must be at least ${validation.value}`
                        );
                    }
                }
                break;
            case 'max':
                if (validation.value && typeof validation.value === 'number') {
                    if (Number(value) > validation.value) {
                        errors.push(
                            validation.message ||
                                /* i18n */ `Must be no more than ${validation.value}`
                        );
                    }
                }
                break;
        }
    }

    return errors;
};
