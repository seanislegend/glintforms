'use client';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@glint/ui/breadcrumb';
import Link from '@glint/ui/link';
import Spinner from '@glint/ui/spinner';
import {useQuery} from '@tanstack/react-query';
import {useParams} from 'next/navigation';
import {Fragment, useCallback, useMemo} from 'react';
import {useI18n} from '@/hooks/use-i18n';
import {useSession} from '@/hooks/use-session';
import {useTRPC} from '@/lib/trpc/react';
import {parseRouteSegments} from '@/utils/breadcrumb';

const BreadcrumbItemWithLink: React.FC<React.PropsWithChildren<{href: string}>> = ({
    href,
    children
}) => {
    return (
        <Fragment key={href}>
            <BreadcrumbItem>
                <BreadcrumbLink className="capitalize" render={<Link href={href}></Link>}>
                    {children}
                </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
        </Fragment>
    );
};

const DynamicBreadcrumbs: React.FC = () => {
    const {t} = useI18n();
    const {segments} = useParams<{segments: string[]}>();
    const routeSegments = parseRouteSegments(segments);
    const {session} = useSession();
    const trpc = useTRPC();
    const {data, isLoading, isStale} = useQuery({
        ...trpc.breadcrumbs.getAll.queryOptions({routeSegments}),
        enabled: Object.keys(routeSegments).length > 0 && !!session,
        staleTime: Infinity,
        gcTime: Infinity
    });

    const getSegmentValue = useCallback(
        (prevSegment: keyof typeof data) => {
            // if we fetch data for dynamic segments, we can use the returned value
            // if it's available
            if (data?.[prevSegment]) {
                return data[prevSegment];
            }
            // otherwise, we can just pull the raw value from the route segments
            return routeSegments[prevSegment];
        },
        [data, routeSegments]
    );

    const breadcrumbs = useMemo(() => {
        if (segments.length === 0) {
            return null;
        }

        return segments
            .reduceRight((acc, segment, i) => {
                const prevSegment = segments[i - 1] as keyof typeof data;
                const isLastItem = i === segments.length - 1;
                const href = `/${segments.slice(0, i + 1).join('/')}`;

                // check if this segment should be treated as a dynamic ID (UUID)
                const isDynamicSegment = prevSegment && routeSegments[prevSegment];

                if (isDynamicSegment) {
                    if ((isLoading && !isStale) || !data) {
                        acc.push(
                            <Fragment key={`loading-${href}`}>
                                <BreadcrumbItem>
                                    <Spinner size="sm" />
                                </BreadcrumbItem>
                                {!isLastItem && <BreadcrumbSeparator className="hidden md:block" />}
                            </Fragment>
                        );
                    } else {
                        if (isLastItem) {
                            acc.push(
                                <BreadcrumbPage key={href} className="capitalize">
                                    {getSegmentValue(prevSegment)}
                                </BreadcrumbPage>
                            );
                        } else {
                            acc.push(
                                <BreadcrumbItemWithLink key={href} href={href}>
                                    {getSegmentValue(prevSegment)}
                                </BreadcrumbItemWithLink>
                            );
                        }
                    }
                } else {
                    // handle static segments (non-UUID segments like 'create', 'edit', etc.)
                    if (isLastItem) {
                        acc.push(
                            <BreadcrumbPage key={href} className="capitalize">
                                {segment}
                            </BreadcrumbPage>
                        );
                    } else {
                        acc.push(
                            <BreadcrumbItemWithLink key={href} href={href}>
                                {segment}
                            </BreadcrumbItemWithLink>
                        );
                    }
                }
                return acc;
            }, [] as React.ReactNode[])
            .reverse();
    }, [segments, routeSegments, isLoading, isStale, data, getSegmentValue]);

    return (
        <Breadcrumb className="overflow-hidden text-ellipsis">
            <BreadcrumbList className="h-8 w-full flex-nowrap [&>li,&>span]:flex-shrink-0">
                <BreadcrumbItemWithLink href="/">{t('Home')}</BreadcrumbItemWithLink>
                {breadcrumbs}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default DynamicBreadcrumbs;
