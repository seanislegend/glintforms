'use client';

import NextLink from 'next/link';
import {useParams} from 'next/navigation';
import type {ComponentProps} from 'react';

type LinkProps = ComponentProps<typeof NextLink>;

const Link: React.FC<LinkProps> = ({href, ...props}) => {
    const params = useParams();
    const locale = params?.locale as string | undefined;

    // prepend locale to href if it exists and href doesn't already start with it
    const localizedHref =
        locale && typeof href === 'string' && !href.startsWith(`/${locale}`)
            ? `/${locale}${href.startsWith('/') ? href : `/${href}`}`
            : href;

    return <NextLink href={localizedHref} {...props} />;
};

export default Link;
