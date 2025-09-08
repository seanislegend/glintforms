'use client';

import {useParams} from 'next/navigation';
import {useCallback} from 'react';
import {useFormContext} from 'react-hook-form';
import {v7 as uuid} from 'uuid';
import type {
    Question,
    QuestionOption,
    QuestionsUpdate,
    QuestionType,
    ValidationRule
} from '@/lib/schemas/questions';

const useQuestionEditor = () => {
    const {surveyId} = useParams<{surveyId: string}>();
    const formMethods = useFormContext();

    const getNewOption = useCallback(
        (): QuestionOption => ({
            id: uuid(),
            value: ''
        }),
        []
    );

    const getNewQuestion = useCallback((): Question => {
        const existingQuestions = formMethods.getValues('questions') || [];
        const nextOrder =
            existingQuestions.length > 0
                ? Math.max(...existingQuestions.map((q: Question) => q.order || 0)) + 1
                : 0;

        return {
            allowOther: false,
            description: '',
            id: uuid(),
            order: nextOrder,
            options: [],
            randomiseOptionsOrder: false,
            required: true,
            surveyId: surveyId,
            title: '',
            type: 'text',
            validations: []
        };
    }, [surveyId, formMethods]);

    const getNewValidationRule = useCallback(
        (): ValidationRule => ({
            enabled: true,
            id: uuid(),
            type: undefined
        }),
        []
    );

    const setQuestion = useCallback(
        (questionIndex: number, question: Question) => {
            formMethods.setValue(`questions.${questionIndex}`, question);
        },
        [formMethods]
    );

    const getQuestion = useCallback(
        (questionIndex: number) => formMethods.getValues(`questions.${questionIndex}`),
        [formMethods]
    );

    const addOption = useCallback(
        (questionIndex: number) => {
            const question = getQuestion(questionIndex);
            const updatedQuestion = {
                ...question,
                options: [...(question.options || []), getNewOption()]
            };
            setQuestion(questionIndex, updatedQuestion);
        },
        [getQuestion, setQuestion, getNewOption]
    );

    const addValidationRule = useCallback(
        (questionIndex: number) => {
            const newValidation: ValidationRule = {
                enabled: true,
                id: uuid(),
                type: undefined
            };
            const question = getQuestion(questionIndex);
            const updatedQuestion = {
                ...question,
                validations: [...(question.validations || []), newValidation]
            };
            setQuestion(questionIndex, updatedQuestion);
        },
        [getQuestion, setQuestion]
    );

    const isCodedQuestion = useCallback((type: QuestionType) => {
        return type === 'multi_select' || type === 'single_select';
    }, []);

    const normaliseValidationRules = useCallback((rules: ValidationRule[]) => {
        return rules.filter(rule => rule.type !== undefined);
    }, []);

    const normaliseQuestions = useCallback(
        (questions: QuestionsUpdate['questions']) => {
            const normalisedData = questions.map((q, index) => ({
                ...q,
                allowOther: isCodedQuestion(q.type) ? (q.allowOther ?? false) : false,
                order: q.order ?? index,
                randomiseOptionsOrder: isCodedQuestion(q.type)
                    ? (q.randomiseOptionsOrder ?? false)
                    : false,
                required: q.required ?? true,
                validations: normaliseValidationRules(q.validations ?? [])
            }));

            return normalisedData;
        },
        [normaliseValidationRules, isCodedQuestion]
    );

    const updateQuestion = useCallback(
        (questionIndex: number, updates: Partial<Question>) => {
            const question = getQuestion(questionIndex);
            // reset validations when question type changes
            const shouldResetValidations = updates.type && updates.type !== question.type;

            // automatically set allowMultiple based on question type
            let allowMultiple = question.allowMultiple;
            if (updates.type) {
                allowMultiple = updates.type === 'multi_select';
            }

            const updatedQuestion = {
                ...question,
                ...updates,
                allowMultiple,
                ...(shouldResetValidations && {validations: []})
            };
            setQuestion(questionIndex, updatedQuestion);
        },
        [getQuestion, setQuestion]
    );

    const removeOption = useCallback(
        (questionIndex: number, optionIndex: number) => {
            const question = getQuestion(questionIndex);
            const updatedQuestion = {
                ...question,
                options: (question.options || []).filter(
                    (_: QuestionOption, index: number) => index !== optionIndex
                )
            };
            setQuestion(questionIndex, updatedQuestion);
        },
        [getQuestion, setQuestion]
    );

    const removeValidationRule = useCallback(
        (questionIndex: number, validationIndex: number) => {
            const question = getQuestion(questionIndex);
            const updatedQuestion = {
                ...question,
                validations: (question.validations || []).filter(
                    (_: ValidationRule, index: number) => index !== validationIndex
                )
            };
            setQuestion(questionIndex, updatedQuestion);
        },
        [getQuestion, setQuestion]
    );

    return {
        addOption,
        addValidationRule,
        getNewOption,
        getNewValidationRule,
        getNewQuestion,
        isCodedQuestion,
        normaliseQuestions,
        removeOption,
        removeValidationRule,
        surveyId,
        updateQuestion
    };
};

export default useQuestionEditor;
