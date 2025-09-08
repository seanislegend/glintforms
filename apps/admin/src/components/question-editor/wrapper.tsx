'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useQuery} from '@tanstack/react-query';
import {useSetAtom} from 'jotai';
import {useParams} from 'next/navigation';
import {createContext, useCallback, useEffect, useRef} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import type {Question, QuestionsUpdate} from '@/lib/schemas/questions';
import {questionsUpdateSchema} from '@/lib/schemas/questions';
import {questionCountAtom} from '@/lib/store';
import {useTRPC} from '@/lib/trpc/react';

interface QuestionEditorContextType {
    isPending: boolean;
    survey?: SurveyDetails | null;
}

export const QuestionEditorContext = createContext<QuestionEditorContextType>({
    isPending: false,
    survey: null
});

const QuestionEditorWrapper: React.FC<React.PropsWithChildren> = ({children}) => {
    const {surveyId} = useParams<{surveyId: string}>();
    const hasInitialised = useRef(false);
    const setQuestionCount = useSetAtom(questionCountAtom);
    const trpc = useTRPC();
    const {data: survey} = useQuery(trpc.surveys.get.queryOptions(surveyId));
    const {data: initialQuestions, isFetching} = useQuery(
        trpc.questions.getAll.queryOptions(surveyId)
    );
    const methods = useForm<QuestionsUpdate>({
        resolver: zodResolver(questionsUpdateSchema),
        defaultValues: {
            deletedQuestionIds: {},
            questions: [],
            surveyId
        }
    });

    const setupQuestions = useCallback((defaultQuestions: Question[]) => {
        return defaultQuestions.map((q, index) => {
            // handle migration from old required field to new validation system
            const question = {
                ...q,
                allowOther: q.allowOther ?? false,
                order: q.order ?? index,
                options: q.options || [],
                randomiseOptionsOrder: q.randomiseOptionsOrder ?? false,
                required: q.required ?? true,
                validations: (q.validations || []).map(v => ({
                    ...v,
                    enabled: v.enabled ?? true
                }))
            };

            return question;
        });
    }, []);

    useEffect(() => {
        if (initialQuestions && !hasInitialised.current) {
            const setupQuestionsData = setupQuestions(initialQuestions as Question[]);
            methods.setValue('questions', setupQuestionsData);
            hasInitialised.current = true;
            setQuestionCount(setupQuestionsData.length);
        }
    }, [initialQuestions, setupQuestions, methods, setQuestionCount]);

    const contextValue: QuestionEditorContextType = {
        isPending: isFetching && !hasInitialised.current,
        survey
    };

    return (
        <QuestionEditorContext.Provider value={contextValue}>
            <FormProvider {...methods}>{children}</FormProvider>
        </QuestionEditorContext.Provider>
    );
};

export default QuestionEditorWrapper;
