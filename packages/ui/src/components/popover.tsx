'use client';

import {Popover as BasePopover} from '@base-ui-components/react/popover';
import {cn} from '../lib/utils';
import ArrowSvg from './arrow-svg';

const Popover: React.FC<React.ComponentProps<typeof BasePopover.Root>> = ({...props}) => {
    return <BasePopover.Root data-slot="popover" {...props} />;
};

const PopoverTrigger: React.FC<React.ComponentProps<typeof BasePopover.Trigger>> = ({...props}) => {
    return <BasePopover.Trigger data-slot="popover-trigger" {...props} />;
};

const PopoverPopup: React.FC<React.ComponentProps<typeof BasePopover.Popup>> = ({
    className,

    ...props
}) => {
    return (
        <BasePopover.Portal>
            <BasePopover.Positioner align="start" side="bottom" sideOffset={8}>
                <BasePopover.Popup
                    data-slot="popover-content"
                    className={cn(
                        'bg-popover rounded text-popover-foreground data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-[var(--transform-origin)] border p-4 shadow-lg shadow-gray-200 outline-hidden',
                        className
                    )}
                    {...props}
                >
                    <BasePopover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                        <ArrowSvg />
                    </BasePopover.Arrow>
                    {props.children}
                </BasePopover.Popup>
            </BasePopover.Positioner>
        </BasePopover.Portal>
    );
};

const PopoverPositioner: React.FC<React.ComponentProps<typeof BasePopover.Positioner>> = ({
    ...props
}) => {
    return <BasePopover.Positioner data-slot="popover-anchor" {...props} />;
};

export {Popover, PopoverTrigger, PopoverPopup, PopoverPositioner};
