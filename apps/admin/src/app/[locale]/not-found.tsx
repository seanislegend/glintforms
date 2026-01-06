'use client';

import {useI18n} from '@/hooks/use-i18n';

const NotFound = () => {
    const {t} = useI18n();

    return <p>{t('Sorry, the page you are looking for does not exist.')}</p>;
};

export default NotFound;
