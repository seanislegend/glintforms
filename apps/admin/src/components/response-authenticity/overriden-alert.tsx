import {Alert, AlertDescription, AlertTitle} from '@glint/ui/alert';
import RelativeDate from '@glint/ui/relative-date';
import {Tooltip, TooltipPopup, TooltipTrigger} from '@glint/ui/tooltip';
import {InfoIcon} from '@phosphor-icons/react/dist/ssr/Info';
import type {AuthenticityScore} from '@/lib/schemas/authenticity';
import {getShortName} from '@/utils/names';

interface Props {
    score: AuthenticityScore;
}

const OverridenAlert: React.FC<Props> = ({score}) => {
    return (
        <Alert className="bg-accent rounded">
            <AlertTitle className="flex items-center gap-2">
                The original score of {score.overrideOriginalPercentage} was overridden{' '}
                {score.overrideTimestamp && (
                    <>
                        <RelativeDate date={new Date(score.overrideTimestamp)} /> by{' '}
                        {getShortName(score.overrideUser?.name)}
                    </>
                )}
                <Tooltip>
                    <TooltipTrigger>
                        <InfoIcon className="size-4" />
                    </TooltipTrigger>
                    <TooltipPopup>
                        The percentage of overridden scores is automatically set to 0 if the
                        response is marked as not authentic, otherwise it's set to 100%.
                    </TooltipPopup>
                </Tooltip>
            </AlertTitle>
            <AlertDescription>"{score.overrideReason}"</AlertDescription>
        </Alert>
    );
};

export default OverridenAlert;
