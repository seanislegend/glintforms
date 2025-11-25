'use client';

import {type ChartConfig, ChartContainer, ChartTooltip} from '@glint/ui/chart';
import {Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis} from 'recharts';

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
    'var(--color-black-500)',
    'var(--color-white-500)'
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
}

const OptionDistributionChart: React.FC<Props> = ({
    className,
    data,
    emptyMessage = 'Selections will appear here once responses are recorded.'
}) => {
    const chartData = data.filter(option => !!option.label);

    if (chartData.length === 0) {
        return <div className="text-sm text-muted-foreground">{emptyMessage}</div>;
    }

    const containerClassName = ['aspect-auto h-[220px] w-full', className]
        .filter(Boolean)
        .join(' ');

    return (
        <ChartContainer className={containerClassName} config={chartConfig}>
            <BarChart
                accessibilityLayer
                data={chartData}
                margin={{bottom: 8, left: 0, right: 12, top: 16}}
            >
                <CartesianGrid horizontal={false} vertical />
                <XAxis dataKey="label" tickLine={false} tick={{fontSize: 12}} type="category" />
                <YAxis allowDecimals={false} dataKey="count" tickLine={false} type="number" />
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
                <Bar dataKey="count" fill={chartConfig.selections.color} radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell
                            key={`cell-${entry.optionId}`}
                            fill={colorPalette[index % colorPalette.length]}
                        />
                    ))}
                    <LabelList
                        className="fill-foreground text-xs"
                        dataKey="count"
                        offset={8}
                        position="top"
                    />
                </Bar>
            </BarChart>
        </ChartContainer>
    );
};

export default OptionDistributionChart;
