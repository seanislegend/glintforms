interface NavItem {
    Icon?: React.ComponentType<{className?: string}>;
    title: string;
    url: string;
}

interface FacetedFilterItem {
    Icon?: React.ComponentType<{className?: string}>;
    label: string;
    value: boolean | number | string | null;
    count?: number;
}
