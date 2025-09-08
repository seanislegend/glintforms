'use client';

import {BasicCard} from '@glint/ui/card';
import {type ChartConfig, ChartContainer, ChartTooltip} from '@glint/ui/chart';
import {Cell, Pie, PieChart} from 'recharts';
import {humanise} from '@/utils/humanise';

interface GenderDistributionData {
    gender: string | null;
    count: number;
}

interface Props {
    data: GenderDistributionData[];
}

const chartConfig = {
    female: {color: 'var(--color-pink-500)'},
    male: {color: 'var(--color-blue-500)'},
    other: {color: 'var(--color-purple-500)'},
    prefer_not_to_say: {color: 'var(--color-yellow-500)'}
} satisfies ChartConfig;

const GenderDistributionChart: React.FC<Props> = ({data}) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <BasicCard title="Gender Distribution">
            <ChartContainer config={chartConfig} className="aspect-square h-[300px] w-full">
                <PieChart
                    accessibilityLayer
                    data={data}
                    margin={{top: 20, right: 20, bottom: 20, left: 20}}
                >
                    <ChartTooltip
                        content={({active, payload}) => {
                            if (!active || !payload?.length) {
                                return null;
                            }

                            const item = payload[0];
                            const percentage =
                                total > 0 ? Math.round((item.value / total) * 100) : 0;

                            return (
                                <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                                    <div className="font-medium">
                                        {humanise(item.payload.gender || 'Not specified')}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2.5 w-2.5 rounded-[2px]"
                                                style={{backgroundColor: item.payload.fill}}
                                            />

                                            <span>
                                                {item.value} responses ({percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                    />
                    <Pie
                        data={data}
                        dataKey="count"
                        nameKey="gender"
                        cx="50%"
                        cy="50%"
                        label
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={0}
                    >
                        {data.map(entry => (
                            <Cell
                                key={`cell-${entry.gender || 'unknown'}`}
                                fill={
                                    entry.gender
                                        ? chartConfig[entry.gender as keyof typeof chartConfig]
                                              ?.color
                                        : 'var(--color-gray-200)'
                                }
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
            <footer>
                <ul className="flex flex-row flex-wrap gap-y-2 gap-x-6">
                    {data.map(entry => (
                        <li key={entry.gender} className="inline-flex text-sm items-center gap-2">
                            <div
                                className="h-2.5 w-2.5 rounded-[2px]"
                                style={{
                                    backgroundColor:
                                        chartConfig[entry.gender as keyof typeof chartConfig]?.color
                                }}
                            />
                            <span>{humanise(entry.gender)}</span>
                        </li>
                    ))}
                </ul>
            </footer>
        </BasicCard>
    );
};

export default GenderDistributionChart;
