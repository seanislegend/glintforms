'use client';

import {Badge} from '@glint/ui/badge';
import {useI18n} from '@/hooks/use-i18n';

const STATUS_VARIANTS = {
    pass: 'success',
    fail: 'error',
    missing: 'stale'
} as const;

const AuthenticityStatusBadge = ({pass}: {pass: boolean}) => {
    const {t} = useI18n();
    const variant =
        STATUS_VARIANTS[typeof pass === 'boolean' ? (pass ? 'pass' : 'fail') : 'missing'];
    return (
        <Badge variant={variant}>
            {typeof pass === 'boolean' ? (pass ? t('Pass') : t('Fail')) : t('Missing')}
        </Badge>
    );
};

export default AuthenticityStatusBadge;
