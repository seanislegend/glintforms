import {cn} from '@glint/ui/utils';
import {CheckIcon} from '@phosphor-icons/react/dist/ssr/Check';
import {XIcon} from '@phosphor-icons/react/dist/ssr/X';

interface Props {
    checks: AuthenticityScoreMetadata['checks'];
}

const ScoreListChecks: React.FC<Props> = ({checks}) => {
    const checkItems = Object.entries(checks);
    if (!checkItems.length) return null;

    return (
        <ul className="text-sm flex flex-row gap-y-2 gap-x-8 flex-wrap">
            {checkItems.map(([check, details]) => (
                <li
                    key={check}
                    className={cn(
                        'flex flex-row gap-1 items-center',
                        details.passed ? 'text-green-600' : 'text-red-600'
                    )}
                >
                    {details.passed ? (
                        <CheckIcon className="size-4" />
                    ) : (
                        <XIcon className="size-4" />
                    )}
                    <span className="capitalize">{check.replace('Check', '')}</span>
                </li>
            ))}
        </ul>
    );
};

export default ScoreListChecks;
