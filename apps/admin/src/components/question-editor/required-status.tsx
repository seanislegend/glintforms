'use client';

import {Badge} from '@glint/ui/badge';
import {use} from 'react';
import {useWatch} from 'react-hook-form';
import {QuestionContext} from './provider';

const QuestionRequiredStatus: React.FC = () => {
    const {questionIndex} = use(QuestionContext);
    const isRequired = useWatch({name: `questions.${questionIndex}.required`});

    if (isRequired) {
        return <Badge variant="error">Required</Badge>;
    }

    return <Badge variant="warning">Optional</Badge>;
};

export default QuestionRequiredStatus;
