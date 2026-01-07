'use client';

import Checkbox from '@glint/form/checkbox';
import {LABEL_CLASSNAME} from '@glint/form/label';
import {Heading5} from '@glint/ui/heading';
import InfoTip from '@glint/ui/info-tip';
import Spacer from '@glint/ui/spacer';
import {CheckIcon} from '@phosphor-icons/react/dist/ssr/Check';
import {XIcon} from '@phosphor-icons/react/dist/ssr/X';
import {use, useMemo} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useI18n} from '@/hooks/use-i18n';
import type {QuestionsUpdate} from '@/lib/schemas/questions';
import {isDraftSurvey} from '@/lib/surveys/disabled-rules';
import {QuestionContext} from './provider';
import useQuestionEditor from './use-question-editor';
import ValidationRules from './validations';
import {QuestionEditorContext} from './wrapper';

const Settings: React.FC = () => {
    const {t} = useI18n();
    const {questionIndex} = use(QuestionContext);
    const {survey} = use(QuestionEditorContext);
    const {control} = useFormContext<QuestionsUpdate>();
    const {isCodedQuestion} = useQuestionEditor();
    const questionType = useWatch({exact: true, name: `questions.${questionIndex}.type`});
    const isDraft = isDraftSurvey(survey?.status);

    const settings = useMemo(
        () =>
            [
                {
                    info: t(
                        'If the question is required, the user will not be able to submit the survey until they have answered the question.'
                    ),
                    label: t('Is required'),
                    name: `questions.${questionIndex}.required` as const
                },
                ...(isCodedQuestion(questionType)
                    ? [
                          {
                              info: t(
                                  'If the question is randomised, the options will be displayed in a random order.'
                              ),
                              label: t('Randomise order'),
                              name: `questions.${questionIndex}.randomiseOptionsOrder` as const
                          },
                          {
                              info: t(
                                  'If the user is allowed to enter a custom value, they will be able to enter a value that is not in the list of options.'
                              ),
                              label: t('Allow other'),
                              name: `questions.${questionIndex}.allowOther` as const
                          }
                      ]
                    : [])
            ] as const,
        [questionIndex, questionType, isCodedQuestion, t]
    );

    return (
        <div>
            <Heading5>{t('Settings')}</Heading5>
            <div className="mt-2 flex flex-col space-y-3">
                {settings.map(setting => (
                    <div key={setting.name} className="inline-flex items-center space-x-2">
                        <Controller
                            control={control}
                            name={setting.name}
                            render={({field}) =>
                                isDraft ? (
                                    <Checkbox
                                        checked={field.value}
                                        className="bg-white"
                                        id={setting.name}
                                        onCheckedChange={field.onChange}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center size-4 shrink-0">
                                        {field.value ? (
                                            <CheckIcon className="size-4 text-green-600" />
                                        ) : (
                                            <XIcon className="size-4 text-red-600" />
                                        )}
                                    </div>
                                )
                            }
                        />
                        <label className={LABEL_CLASSNAME} htmlFor={setting.name}>
                            {setting.label}
                        </label>
                        <InfoTip tip={setting.info} />
                    </div>
                ))}
            </div>
            <Spacer />
            <ValidationRules />
        </div>
    );
};

export default Settings;
