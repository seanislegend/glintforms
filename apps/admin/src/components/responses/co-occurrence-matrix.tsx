'use client';

import {
    TooltipPopup,
    TooltipProvider,
    TooltipRoot,
    TooltipTrigger,
    TooltipUtils
} from '@glint/ui/tooltip';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useTRPC} from '@/lib/trpc/react';
import {formatPercentage} from '@/utils/percentage';

interface Props {
    className?: string;
    emptyMessage?: string;
    questionId: string;
}

const CoOccurrenceMatrix: React.FC<Props> = ({
    className,
    emptyMessage = 'Co-occurrence patterns will appear here once responses are recorded.',
    questionId
}) => {
    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.answers.getCoOccurrenceData.queryOptions({questionId}));

    if (!data || data.options.length === 0) {
        return <div className="text-sm text-muted-foreground">{emptyMessage}</div>;
    }

    const totalResponses = data.totalResponses || 1;
    const coOccurrences = data.coOccurrences as Record<string, Record<string, number>>;

    // find max percentage for normalisation
    let maxPercentage = 0;
    for (const row of Object.values(coOccurrences)) {
        for (const count of Object.values(row)) {
            const percentage = (count / totalResponses) * 100;
            if (percentage > maxPercentage) maxPercentage = percentage;
        }
    }
    if (maxPercentage === 0) maxPercentage = 1;

    // calculate intensity and color based on percentage
    const getIntensity = (count: number): number => {
        const percentage = (count / totalResponses) * 100;
        return percentage / maxPercentage;
    };
    const getColor = (intensity: number): string => {
        const opacity = 0.1 + intensity * 0.7;
        return `rgba(59, 130, 246, ${opacity})`;
    };

    const getCount = (opt1Id: string, opt2Id: string): number => {
        return coOccurrences[opt1Id]?.[opt2Id] ?? 0;
    };

    const tooltipHandle = TooltipUtils.createHandle();
    const containerClassName = ['w-full', className].filter(Boolean).join(' ');

    return (
        <TooltipProvider delay={0}>
            <div className={containerClassName}>
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-left text-xs font-medium text-muted-foreground p-2 sticky left-0 bg-background z-10">
                                        Option
                                    </th>
                                    {data.options.map(opt => (
                                        <th
                                            key={opt.id}
                                            className="text-xs font-medium text-muted-foreground p-2 text-center min-w-[80px]"
                                        >
                                            <div className="truncate max-w-[80px] cursor-help">
                                                {opt.label}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.options.map(opt1 => {
                                    const opt1Label = opt1.label;
                                    return (
                                        <tr key={opt1.id}>
                                            <TooltipTrigger
                                                handle={tooltipHandle}
                                                payload={{tooltipText: opt1Label}}
                                                render={
                                                    <td className="text-xs font-medium p-2 sticky left-0 bg-background z-10 border-r">
                                                        <div className="truncate max-w-[120px]">
                                                            {opt1Label}
                                                        </div>
                                                    </td>
                                                }
                                            />
                                            {data.options.map(opt2 => {
                                                const count = getCount(opt1.id, opt2.id);
                                                const percentage = (count / totalResponses) * 100;
                                                const intensity = getIntensity(count);
                                                const bgColor = getColor(intensity);
                                                const opt2Label = opt2.label;

                                                const renderEl = (
                                                    <td
                                                        className="text-center p-2 border"
                                                        style={{backgroundColor: bgColor}}
                                                    >
                                                        <span className="text-xs font-medium inline-block min-h-[1.25rem]">
                                                            {count > 0
                                                                ? formatPercentage(percentage)
                                                                : '0%'}
                                                        </span>
                                                    </td>
                                                );

                                                // only return tooltips for different options
                                                if (opt1Label === opt2Label) {
                                                    return renderEl;
                                                }

                                                const tooltipText = `Respondents who selected ${opt2Label} and ${opt1Label}: ${formatPercentage(percentage)} (${count} response${count !== 1 ? 's' : ''})`;

                                                return (
                                                    <TooltipTrigger
                                                        key={opt2.id}
                                                        data-slot="tooltip-trigger"
                                                        handle={tooltipHandle}
                                                        payload={{tooltipText}}
                                                        render={renderEl}
                                                    />
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <TooltipRoot handle={tooltipHandle}>
                {({payload}) => (
                    <TooltipPopup>
                        {payload !== undefined && (
                            // @ts-expect-error - payload is not typed
                            <span>{payload?.tooltipText}</span>
                        )}
                    </TooltipPopup>
                )}
            </TooltipRoot>
        </TooltipProvider>
    );
};

export default CoOccurrenceMatrix;
