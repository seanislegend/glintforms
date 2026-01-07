'use client';

import {Badge} from '@glint/ui/badge';
import {use} from 'react';
import {useWatch} from 'react-hook-form';
import {useI18n} from '@/hooks/use-i18n';
import {QuestionContext} from './provider';

const QuestionRequiredStatus: React.FC = () => {
    const {t} = useI18n();
    const {questionIndex} = use(QuestionContext);
    const isRequired = useWatch({name: `questions.${questionIndex}.required`});

    if (isRequired) {
        return <Badge variant="error">{t('Required')}</Badge>;
    }

    return <Badge variant="warning">{t('Optional')}</Badge>;
};

export default QuestionRequiredStatus;
