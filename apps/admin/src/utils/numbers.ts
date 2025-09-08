export const formatNumber = (number: number) => {
    if (!number) return '';
    return new Intl.NumberFormat().format(number);
};
