export const formatDay = (dayOfWeek: number) => {
    if (typeof dayOfWeek !== 'number') return '';
    const days = [
        /* i18n */ 'Sunday',
        /* i18n */ 'Monday',
        /* i18n */ 'Tuesday',
        /* i18n */ 'Wednesday',
        /* i18n */ 'Thursday',
        /* i18n */ 'Friday',
        /* i18n */ 'Saturday'
    ];
    return days[dayOfWeek] || /* i18n */ 'Unknown';
};
