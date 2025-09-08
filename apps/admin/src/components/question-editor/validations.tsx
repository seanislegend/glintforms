'use client';

import Button from '@glint/ui/button';
import {Heading5} from '@glint/ui/heading';
import ToggleVisibility from '@glint/ui/toggle-visibility';
import {PlusIcon} from '@phosphor-icons/react/dist/ssr/Plus';
import {use, useMemo} from 'react';
import {useFieldArray, useWatch} from 'react-hook-form';
import {validationRuleConfigs} from '@/lib/schemas/questions';
import {QuestionContext} from './provider';
import useQuestionEditor from './use-question-editor';
import ValidationsRule from './validations-rule';

const QuestionValidationRules: React.FC = () => {
    const {questionIndex} = use(QuestionContext);
    const questionType = useWatch({name: `questions.${questionIndex}.type`});
    const {append, fields, remove} = useFieldArray({
        name: `questions.${questionIndex}.validations`
    });
    const {getNewValidationRule} = useQuestionEditor();

    const maxValidations = useMemo(() => {
        return Object.entries(validationRuleConfigs).filter(([_, config]) =>
            config.applicableTypes.includes(questionType)
        ).length;
    }, [questionType]);
    const isDisabled = fields.length >= maxValidations || questionType === 'single_select';
    const isVisible = fields.length > 0 && questionType !== 'single_select';

    return (
        <div>
            <Heading5>Validation rules</Heading5>
            <ToggleVisibility className="mt-2 space-y-2" initial="hidden" visible={isVisible}>
                {fields.map((rule, ruleIndex) => (
                    <ValidationsRule
                        key={rule.id}
                        onRemove={() => remove(ruleIndex)}
                        questionType={questionType}
                        ruleIndex={ruleIndex}
                    />
                ))}
            </ToggleVisibility>
            <Button
                className="mt-2"
                disabled={isDisabled}
                onClick={() => append(getNewValidationRule())}
                size="sm"
                variant="outline"
            >
                <PlusIcon className="!size-4" />
                Add validation rule
            </Button>
        </div>
    );
};

export default QuestionValidationRules;
