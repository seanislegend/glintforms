import {WarningIcon} from '@phosphor-icons/react/dist/ssr/Warning';
import Checklist from './checklist';

interface Props {
    metadata: AuthenticityScoreMetadata;
}

const AuthenticityReasoning: React.FC<Props> = ({metadata}) => {
    if (!metadata) return null;

    return (
        <div className="space-y-2">
            {metadata.aiReasoning && <p className="text-sm">{metadata.aiReasoning}</p>}
            {metadata.checks && <Checklist checks={metadata.checks} />}
            {metadata.failureReasons && metadata.failureReasons.length > 0 && (
                <div className="pt-2">
                    <div className="bg-orange-50 rounded border border-orange-100 px-4 py-2">
                        <div className="flex gap-x-1 flex-row items-center">
                            <WarningIcon className="size-4" />
                            <span className="text-sm font-medium">Issues found</span>
                        </div>
                        <ul className="text-sm mt-2 space-y-1 list-disc list-outside pl-4">
                            {metadata.failureReasons.map((reason: string, index: number) => (
                                <li key={`${index}-${reason.substring(0, 20)}`}>{reason}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthenticityReasoning;
