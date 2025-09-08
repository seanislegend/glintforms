'use client';

import {FormField} from '@glint/form/fields';
import Input from '@glint/form/input';
import Button from '@glint/ui/button';
import {TrashIcon} from '@phosphor-icons/react/dist/ssr/Trash';
import {use, useCallback} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {
    type QuestionsUpdate,
    type QuestionType,
    type ValidationRule,
    type ValidationRuleType,
    validationRuleConfigs
} from '@/lib/schemas/questions';
import {QuestionContext} from './provider';

interface Props {
    onRemove: () => void;
    questionType: QuestionType;
    ruleIndex: number;
}

const QuestionValidations: React.FC<Props> = ({onRemove, questionType, ruleIndex}) => {
    const {questionIndex} = use(QuestionContext);
    const {control} = useFormContext<QuestionsUpdate>();
    const rules = useWatch({name: `questions.${questionIndex}.validations`});
    const rule = rules[ruleIndex] as ValidationRule;

    const getApplicableValidationTypes = useCallback(
        (excludeValidationId?: string): ValidationRuleType[] => {
            return Object.entries(validationRuleConfigs)
                .filter(([type, config]) => {
                    // only show selection-based rules for multi select fields
                    if (
                        ['minSelections', 'maxSelections'].includes(type) &&
                        questionType !== 'multi_select'
                    ) {
                        return false;
                    }

                    // filter out validation types that are already in use (excluding the current validation being edited)
                    const isAlreadyUsed = rules.some(
                        (v: ValidationRule) => v.type === type && v.id !== excludeValidationId
                    );

                    if (isAlreadyUsed) {
                        return false;
                    }
                    return config.applicableTypes.includes(questionType);
                })
                .map(([type]) => type as ValidationRuleType);
        },
        [questionType, rules]
    );

    const getPlaceholder = useCallback((type: ValidationRuleType) => {
        const config = validationRuleConfigs[type];
        if (!config?.requiresValue) return 'N/A';
        return config.valueType === 'number'
            ? config.valueType === 'number'
                ? 'Enter number'
                : 'Enter value'
            : 'N/A';
    }, []);

    const config = rule.type ? validationRuleConfigs[rule.type] : null;

    return (
        <div className="@container/rule">
            <div className="flex gap-2 @md/rule:flex-row flex-col items-start animate-in fade-in">
                <div className="@md/rule:w-[calc(50%-20px)] w-full">
                    <FormField
                        control={control}
                        fieldType="select"
                        name={`questions.${questionIndex}.validations.${ruleIndex}.type`}
                        options={getApplicableValidationTypes(rule.id).map(type => ({
                            label: validationRuleConfigs[type].label,
                            value: type
                        }))}
                        placeholder="Select rule"
                    />
                </div>
                <div className="@md/rule:w-[calc(50%-20px)] w-full">
                    <FormField
                        control={control}
                        name={`questions.${questionIndex}.validations.${ruleIndex}.value`}
                        render={({field}) => (
                            <Input
                                className="bg-white"
                                disabled={!config?.requiresValue}
                                placeholder={getPlaceholder(rule.type as ValidationRuleType)}
                                type={config?.valueType === 'number' ? 'number' : 'text'}
                                {...field}
                                value={String(field.value ?? '')}
                            />
                        )}
                    />
                </div>
                <Button
                    className="w-[40px] !px-4"
                    onClick={onRemove}
                    size="sm"
                    variant="destructiveGhost"
                >
                    <TrashIcon />
                </Button>
            </div>
        </div>
    );
};

export default QuestionValidations;
