import {AUTHENTICITY_THRESHOLD, AUTHENTICITY_THRESHOLD_MEDIUM} from '@/lib/schemas/constants';
import {isAuthenticityPass} from '@/utils/authenticity';

interface Props {
    score: number;
}

const ScoreBadge: React.FC<Props> = ({score}) => {
    const isPass = isAuthenticityPass(score);
    const getScoreLabel = (score: number) => {
        if (score >= AUTHENTICITY_THRESHOLD) return 'high';
        if (score >= AUTHENTICITY_THRESHOLD_MEDIUM) return 'medium';
        return 'low';
    };

    const getCircleColour = (score: number, isPass: boolean) => {
        if (!isPass) return 'stroke-red-500';
        if (score >= AUTHENTICITY_THRESHOLD) return 'stroke-green-500';
        if (score >= AUTHENTICITY_THRESHOLD_MEDIUM) return 'stroke-yellow-500';
        return 'stroke-red-500';
    };

    const getTextColour = (score: number, isPass: boolean) => {
        if (!isPass) return 'text-red-500';
        if (score >= AUTHENTICITY_THRESHOLD) return 'text-green-500';
        if (score >= AUTHENTICITY_THRESHOLD_MEDIUM) return 'text-yellow-500';
        return 'text-red-500';
    };

    const label = getScoreLabel(score);
    const circleColour = getCircleColour(score, isPass);
    const textColour = getTextColour(score, isPass);
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center w-full h-full aspect-square max-w-full max-h-full">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <title>{`Authenticity Score: ${score}%`}</title>
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-in-out ${circleColour}`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                <span
                    className={`text-[clamp(0.8rem,4vw,1.5rem)] leading-none font-bold ${textColour}`}
                >
                    {score}%
                </span>
                <span
                    className={`text-[clamp(0.5rem,2vw,0.65rem)] leading-none font-medium uppercase ${textColour}`}
                >
                    {label}
                </span>
            </div>
        </div>
    );
};

export default ScoreBadge;
