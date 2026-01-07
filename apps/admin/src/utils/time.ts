export const formatDuration = (minutes: number) => {
    if (!minutes) return '';
    if (minutes < 1) return `< 1 ${/* i18n */ 'min'}`;
    if (minutes < 60) return `${minutes} ${/* i18n */ 'min'}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
        ? `${hours}${/* i18n */ 'h'} ${remainingMinutes}${/* i18n */ 'm'}`
        : `${hours}${/* i18n */ 'h'}`;
};

export const formatDurationToClosestSecond = (seconds: number) => {
    if (seconds < 1) return `< 1${/* i18n */ 's'}`;
    if (seconds < 60) return `${Math.round(seconds)}${/* i18n */ 's'}`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (minutes < 60)
        return remainingSeconds > 0
            ? `${minutes}${/* i18n */ 'm'} ${remainingSeconds}${/* i18n */ 's'}`
            : `${minutes}${/* i18n */ 'm'}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
        ? `${hours}${/* i18n */ 'h'} ${remainingMinutes}${/* i18n */ 'm'}`
        : `${hours}${/* i18n */ 'h'}`;
};
