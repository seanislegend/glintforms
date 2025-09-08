'use client';

import {createContext} from 'react';

interface QuestionContextValue {
    questionIndex: number;
}

interface Props {
    children: React.ReactNode;
    questionIndex: number;
}

export const QuestionContext = createContext<QuestionContextValue>({questionIndex: 0});

const QuestionProvider: React.FC<Props> = ({children, questionIndex}) => {
    return <QuestionContext.Provider value={{questionIndex}}>{children}</QuestionContext.Provider>;
};

export default QuestionProvider;
