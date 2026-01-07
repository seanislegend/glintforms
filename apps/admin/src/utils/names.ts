export const getShortName = (name?: string) => {
    if (!name) {
        /* i18n */
        return 'Unknown user';
    }

    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0];
    return `${nameParts[0]} ${nameParts[1]?.[0]}.`;
};

export const getInitials = (name?: string) => {
    if (!name) {
        /* i18n */
        return 'Unknown user';
    }

    const nameParts = name.split(' ').filter(Boolean);
    if (nameParts.length === 1) return nameParts[0];
    return `${nameParts[0]?.[0]}${nameParts[1]?.[0]}`;
};
