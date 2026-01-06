'use client';

import {useI18n} from '@/hooks/use-i18n';

interface DataItem extends Record<string, unknown> {
    color: string;
    dataKey: string;
    fill: string;
    hide: boolean;
    name: string;
    nameKey?: string;
    payload: ResponsesTimeDataPoint | ResponsesDayDataPoint;
    stroke: string;
    strokeWidth: number;
    value: number | string;
}

interface Props {
    active: boolean;
    label: string;
    labelFormatter?: (value: number | string) => string;
    payload: DataItem[];
}

const ResponsesChartTooltip: React.FC<Props> = ({active, label, labelFormatter, payload}) => {
    const {t} = useI18n();

    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
            <div className="font-medium">{labelFormatter ? labelFormatter(label) : label}</div>
            <div className="grid gap-1.5">
                {payload.map(item => {
                    const isAuthenticityField = item.dataKey === 'passed';
                    const isCompletionField = item.dataKey === 'completed';
                    let displayValue =
                        typeof item.value === 'number'
                            ? item.value.toLocaleString()
                            : String(item.value);

                    if (isAuthenticityField) {
                        displayValue = `${Math.ceil((item.payload.passed / item.payload.completed) * 100)}%`;
                    } else if (isCompletionField) {
                        displayValue = `${Math.ceil((item.payload.completed / item.payload.count) * 100)}%`;
                    }

                    return (
                        <div
                            key={item.dataKey}
                            className="flex w-full flex-wrap items-stretch gap-2"
                        >
                            <div
                                className="shrink-0 rounded-[2px] h-2.5 w-2.5"
                                style={{backgroundColor: item.color, borderColor: item.color}}
                            />
                            <div className="flex flex-1 justify-between leading-none items-center gap-x-4">
                                <div className="grid gap-1.5">
                                    <span className="text-muted-foreground capitalize">
                                        {isAuthenticityField
                                            ? t('Authenticity rate')
                                            : isCompletionField
                                              ? t('Completion rate')
                                              : item.name}
                                    </span>
                                </div>
                                <span className="text-foreground font-mono font-medium tabular-nums">
                                    {displayValue}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResponsesChartTooltip;
