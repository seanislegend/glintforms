'use client';

import {type ChartConfig, ChartContainer, ChartTooltip} from '@glint/ui/chart';
import clsx from 'clsx';
import {Bar, BarChart, Cell, LabelList, XAxis, YAxis} from 'recharts';

const colorPalette = [
    'var(--color-blue-500)',
    'var(--color-green-500)',
    'var(--color-yellow-500)',
    'var(--color-red-500)',
    'var(--color-purple-500)',
    'var(--color-orange-500)',
    'var(--color-pink-500)',
    'var(--color-gray-500)',
    'var(--color-brown-500)',
    'var(--color-black-500)'
];

const chartConfig = {
    selections: {
        color: 'var(--chart-1)',
        label: 'Selections'
    }
} satisfies ChartConfig;

interface Props {
    className?: string;
    data: QuestionOptionCount[];
    emptyMessage?: string;
    showCount?: boolean;
}

const OptionDistributionChart: React.FC<Props> = ({
    className,
    data,
    emptyMessage = 'Selections will appear here once responses are recorded.',
    showCount = true
}) => {
    const chartData = data.filter(option => !!option.label);

    if (chartData.length === 0) {
        return <div className="text-sm text-muted-foreground">{emptyMessage}</div>;
    }

    return (
        <ChartContainer
            className={clsx(['aspect-auto h-[180px] w-full', className])}
            config={chartConfig}
        >
            <BarChart
                accessibilityLayer
                barCategoryGap={2}
                data={chartData}
                layout="vertical"
                margin={{right: 16}}
            >
                <YAxis
                    dataKey="label"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    hide
                    type="category"
                />
                <XAxis
                    allowDecimals={false}
                    dataKey="count"
                    domain={['dataMin', 'dataMax']}
                    hide
                    type="number"
                />
                <ChartTooltip
                    cursor={false}
                    content={({active, payload}) => {
                        if (!active || !payload?.length) return null;
                        const item = payload[0];
                        return (
                            <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                                <div className="font-medium">{item.payload.label}</div>
                                <div className="text-muted-foreground">{item.value} selections</div>
                            </div>
                        );
                    }}
                />
                <Bar dataKey="count" fill={chartConfig.selections.color} radius={4}>
                    {chartData.map((entry, index) => (
                        <Cell key={entry.label} fill={colorPalette[index % colorPalette.length]} />
                    ))}
                    <LabelList
                        dataKey="label"
                        position="insideLeft"
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                    />
                    {showCount && (
                        <LabelList
                            dataKey="count"
                            position="right"
                            offset={8}
                            className="fill-foreground"
                            fontSize={12}
                        />
                    )}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
};

export default OptionDistributionChart;
