import type {VariantProps} from 'class-variance-authority';
import type {ReactNode} from 'react';
import Button, {type buttonVariants} from './button';
import {Tooltip, TooltipPopup, TooltipTrigger} from './tooltip';

interface Props extends React.ComponentProps<'button'> {
    children: ReactNode;
    disabledReason?: string | null;
    pending?: boolean;
    size?: VariantProps<typeof buttonVariants>['size'];
    variant?: VariantProps<typeof buttonVariants>['variant'];
}

const ButtonWithTooltip: React.FC<Props> = ({
    children,
    disabledReason,
    disabled,
    ...buttonProps
}) => {
    const isDisabled = disabled || !!disabledReason;

    if (!disabledReason) {
        return (
            <Button disabled={isDisabled} {...buttonProps}>
                {children}
            </Button>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <span>
                        <Button disabled={isDisabled} {...buttonProps}>
                            {children}
                        </Button>
                    </span>
                }
            />
            <TooltipPopup>
                <p>{disabledReason}</p>
            </TooltipPopup>
        </Tooltip>
    );
};

export default ButtonWithTooltip;
