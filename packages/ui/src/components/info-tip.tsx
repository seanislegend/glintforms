import {Tooltip, TooltipPopup, TooltipTrigger} from '@glint/ui/tooltip';
import {InfoIcon} from '@phosphor-icons/react/dist/ssr/Info';

interface Props {
    tip: string;
}

const InfoTip: React.FC<Props> = ({tip}) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <span className="text-muted-foreground text-sm">
                    <InfoIcon className="w-4 h-4" />
                </span>
            }
        />
        <TooltipPopup>
            <p>{tip}</p>
        </TooltipPopup>
    </Tooltip>
);

export default InfoTip;
