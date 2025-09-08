import {usePathname} from 'next/navigation';

import type {BreadcrumbItem} from '../lib/store';

// route to label mapping
const routeLabels: Record<string, string> = {
    surveys: 'Surveys',
    campaigns: 'Campaigns',
    dashboard: 'Dashboard',
    questions: 'Questions',
    responses: 'Responses',
    create: 'Create'
};

export const useBreadcrumbs = () => {
    const pathname = usePathname();

    const generateBreadcrumbs = (): BreadcrumbItem[] => {
        const segments = pathname.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [{label: 'Home', href: '/'}];

        let currentPath = '';

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            if (!segment) continue;

            currentPath += `/${segment}`;
            const isLast = i === segments.length - 1;

            // get label from mapping or capitalize segment
            const label =
                routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

            breadcrumbs.push({
                label,
                href: isLast ? undefined : currentPath
            });
        }

        return breadcrumbs;
    };

    return {
        breadcrumbs: generateBreadcrumbs(),
        pathname
    };
};
