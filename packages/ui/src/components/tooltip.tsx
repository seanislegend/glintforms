'use client';

import {Tooltip as BaseTooltip} from '@base-ui-components/react/tooltip';
import type * as React from 'react';
import {cn} from '../lib/utils';

const TooltipProvider: React.FC<React.ComponentProps<typeof BaseTooltip.Provider>> = ({
    delay = 0,
    ...props
}) => {
    return <BaseTooltip.Provider data-slot="tooltip-provider" delay={delay} {...props} />;
};

const TooltipRoot: React.FC<React.ComponentProps<typeof BaseTooltip.Root>> = ({...props}) => {
    return <BaseTooltip.Root data-slot="tooltip" {...props} />;
};

const Tooltip: React.FC<React.ComponentProps<typeof BaseTooltip.Root>> = ({...props}) => {
    return (
        <TooltipProvider>
            <TooltipRoot {...props} />
        </TooltipProvider>
    );
};

const TooltipTrigger: React.FC<React.ComponentProps<typeof BaseTooltip.Trigger>> = ({...props}) => {
    return <BaseTooltip.Trigger data-slot="tooltip-trigger" {...props} />;
};

const TooltipPopup: React.FC<
    React.ComponentProps<typeof BaseTooltip.Popup> & {
        positionSideOffset?: BaseTooltip.Positioner.Props['sideOffset'];
    }
> = ({className, positionSideOffset = 0, children, ...props}) => {
    return (
        <BaseTooltip.Portal className="z-100 relative">
            <BaseTooltip.Positioner sideOffset={positionSideOffset}>
                <BaseTooltip.Popup
                    data-slot="tooltip-content"
                    className={cn(
                        'bg-black text-white rounded z-100 animate-in fade-in-0 zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-fit origin-[var(--transform-origin)] px-3 py-1.5 text-xs text-pretty max-w-[400px]',
                        className
                    )}
                    {...props}
                >
                    {children}
                </BaseTooltip.Popup>
            </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
    );
};

const TooltipUtils = BaseTooltip;

export {Tooltip, TooltipTrigger, TooltipPopup, TooltipProvider, TooltipRoot, TooltipUtils};
