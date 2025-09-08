'use client';

import {Avatar as BaseAvatar} from '@base-ui-components/react/avatar';
import {cn} from '../lib/utils';

const Avatar: React.FC<React.ComponentProps<typeof BaseAvatar.Root>> = ({className, ...props}) => {
    return (
        <BaseAvatar.Root
            data-slot="avatar"
            className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
            {...props}
        />
    );
};

const AvatarImage: React.FC<React.ComponentProps<typeof BaseAvatar.Image>> = ({
    className,
    ...props
}) => {
    return (
        <BaseAvatar.Image
            data-slot="avatar-image"
            className={cn('aspect-square size-full', className)}
            {...props}
        />
    );
};

const AvatarFallback: React.FC<React.ComponentProps<typeof BaseAvatar.Fallback>> = ({
    className,
    ...props
}) => {
    return (
        <BaseAvatar.Fallback
            data-slot="avatar-fallback"
            className={cn(
                'bg-muted flex size-full items-center justify-center rounded-full',
                className
            )}
            {...props}
        />
    );
};

export {Avatar, AvatarImage, AvatarFallback};
