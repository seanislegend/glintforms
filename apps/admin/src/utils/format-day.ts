export const formatDay = (dayOfWeek: number) => {
    if (typeof dayOfWeek !== 'number') return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || 'Unknown';
};
