// validation rule types from the admin app
export type ValidationRuleType =
    | 'minLength'
    | 'maxLength'
    | 'min'
    | 'max'
    | 'minSelections'
    | 'maxSelections'
    | 'email'
    | 'url';

export interface ValidationRule {
    id: string;
    message?: string;
    type?: ValidationRuleType;
    value?: string | number | boolean;
}
