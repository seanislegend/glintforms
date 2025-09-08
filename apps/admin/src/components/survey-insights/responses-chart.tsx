import {type ChartConfig, ChartContainer, ChartTooltip} from '@glint/ui/chart';
import {Bar, BarChart, CartesianGrid, LabelList, XAxis} from 'recharts';
import ResponsesChartTooltip from './responses-chart-tooltip';

interface Props {
    data: (ResponsesTimeDataPoint | ResponsesDayDataPoint)[];
    lineDataKey: string;
    showAuthenticity: boolean | null;
    showCompletionRate: boolean | null;
    showLabels: boolean | null;
    tooltipLabelFormatter?: (value: number | string) => string;
    xAxis?: {
        dataKey?: string;
        tickFormatter?: (value: number | string) => string;
    };
}

const chartConfig = {
    authenticityRate: {
        color: 'var(--color-green-500)',
        label: 'Authenticity Rate (%)'
    },
    count: {
        color: 'var(--color-blue-500)',
        label: 'Responses'
    },
    completionRate: {
        color: 'var(--color-blue-300)',
        label: 'Completion Rate (%)'
    }
} satisfies ChartConfig;

const ResponsesOverviewChart: React.FC<Props> = ({
    data,
    lineDataKey,
    showAuthenticity,
    showCompletionRate,
    showLabels,
    tooltipLabelFormatter,
    xAxis
}) => {
    return (
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart accessibilityLayer data={data} margin={{left: 12, top: 30, right: 12}}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey={xAxis?.dataKey ?? lineDataKey}
                    minTickGap={32}
                    tickMargin={8}
                    tickFormatter={xAxis?.tickFormatter}
                />
                {tooltipLabelFormatter && (
                    <ChartTooltip
                        content={({active, payload, label}) => (
                            <ResponsesChartTooltip
                                active={active}
                                payload={payload}
                                label={String(label || '')}
                                labelFormatter={tooltipLabelFormatter}
                            />
                        )}
                    />
                )}
                <Bar
                    fill={chartConfig.count.color}
                    dataKey={lineDataKey}
                    stroke={chartConfig.count.color}
                    strokeWidth={2}
                    stackId="a"
                    type="natural"
                >
                    {showLabels && (
                        <LabelList
                            position="top"
                            offset={12}
                            className="fill-foreground"
                            fontSize={12}
                        />
                    )}
                </Bar>
                {showCompletionRate && (
                    <Bar
                        dataKey="completed"
                        fill={chartConfig.completionRate.color}
                        stroke={chartConfig.completionRate.color}
                        strokeWidth={2}
                        stackId="b"
                        type="natural"
                    >
                        {showLabels && (
                            <LabelList
                                className="fill-foreground"
                                fontSize={12}
                                offset={12}
                                position="top"
                            />
                        )}
                    </Bar>
                )}
                {showAuthenticity && (
                    <Bar
                        dataKey="passed"
                        fill={chartConfig.authenticityRate.color}
                        stroke={chartConfig.authenticityRate.color}
                        strokeWidth={2}
                        type="natural"
                        stackId="c"
                    >
                        {showLabels && (
                            <LabelList
                                className="fill-foreground"
                                fontSize={12}
                                offset={12}
                                position="top"
                            />
                        )}
                    </Bar>
                )}
            </BarChart>
        </ChartContainer>
    );
};

export default ResponsesOverviewChart;
