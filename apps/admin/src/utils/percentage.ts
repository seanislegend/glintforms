export const formatPercentage = (number: number) => {
    const formatted = Number(number.toFixed(2)).toString();
    return `${formatted}%`;
};
